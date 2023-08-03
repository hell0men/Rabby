import React, { useEffect } from 'react';
import styled from 'styled-components';
import { InfoCircleOutlined } from '@ant-design/icons';
import WordsMatrix from '@/ui/component/WordsMatrix';
import clsx from 'clsx';
import { connectStore, useRabbyDispatch, useRabbySelector } from 'ui/store';
import LessPalette from '@/ui/style/var-defs';
import { styid } from '@/ui/utils/styled';
import { openInternalPageInTab, useWallet } from 'ui/utils';
import { Account } from '@/background/service/preference';
import IconCopy from 'ui/assets/component/icon-copy.svg';
import IconSuccess from 'ui/assets/success.svg';
import { Button, message } from 'antd';
import { copyTextToClipboard } from '@/ui/utils/clipboard';
import { generateAliasName } from '@/utils/account';
import { BRAND_ALIAN_TYPE_TEXT, KEYRING_CLASS, KEYRING_TYPE } from '@/constant';
import LogoSVG from '@/ui/assets/logo.svg';
import IconBack from 'ui/assets/back.svg';

const AlertBlock = styled.div`
  padding: 10px 12px;
  color: ${LessPalette['@color-red']};
  background: rgba(236, 81, 81, 0.1);
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
`;

const CopySection = styled.div`
  color: ${LessPalette['@color-comment-1']};
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  cursor: pointer;
`;

const TipTextList = styled.ol`
  list-style-type: decimal;

  > li {
    font-weight: 400;
    color: ${LessPalette['@color-body']};
    line-height: 20px;
  }

  > li + li {
    margin-top: 4px;
  }
`;

const MnemonicsWrapper = styled.div`
  & + ${styid(TipTextList)} {
    margin-top: 20px;
  }
`;

const DisplayMnemonic = () => {
  const dispatch = useRabbyDispatch();
  const wallet = useWallet();
  useEffect(() => {
    dispatch.createMnemonics.prepareMnemonicsAsync();
  }, []);

  const { mnemonics } = useRabbySelector((s) => ({
    mnemonics: s.createMnemonics.mnemonics,
  }));

  const onCopyMnemonics = React.useCallback(() => {
    copyTextToClipboard(mnemonics).then(() => {
      message.success({
        icon: <img src={IconSuccess} className="icon icon-success" />,
        content: 'Copied',
        duration: 0.5,
      });
    });
  }, [mnemonics]);

  const onSubmit = React.useCallback(() => {
    wallet.createKeyringWithMnemonics(mnemonics).then(async () => {
      const keyring = await wallet.getKeyringByMnemonic(mnemonics);
      const keyringId = await wallet.getMnemonicKeyRingIdFromPublicKey(
        keyring!.publicKey!
      );

      openInternalPageInTab(
        `import/select-address?hd=${KEYRING_CLASS.MNEMONIC}&keyringId=${keyringId}`
      );

      dispatch.createMnemonics.reset();
    });
  }, [mnemonics]);

  return (
    <div className={clsx('mx-auto pt-[58px]', 'w-[600px]')}>
      <img src={LogoSVG} alt="Rabby" className="mb-[12px]" />
      <div
        className={clsx(
          'px-[100px] pt-[32px] pb-[40px]',
          'bg-white rounded-[12px]',
          'relative'
        )}
      >
        <div
          className="cursor-pointer absolute left-[100px] top-[32px]"
          onClick={() => dispatch.createMnemonics.stepTo('risk-check')}
        >
          <img src={IconBack} />
        </div>
        <h1
          className={clsx(
            'flex items-center justify-center',
            'space-x-[16px] mb-[14px]',
            'text-[20px] text-gray-title'
          )}
        >
          <span>Backup Seed Phrase</span>
        </h1>
        <div className="px-20 pt-24">
          <AlertBlock className="flex justify-center items-center mb-[24px] rounded-[4px]">
            <InfoCircleOutlined className="mr-10" />
            <p className="mb-0">
              Make sure no one else is watching your screen when you back up the
              seed phrase
            </p>
          </AlertBlock>
          <MnemonicsWrapper className="relative">
            <div className="rounded-[6px] flex items-center">
              <WordsMatrix
                focusable={false}
                closable={false}
                words={mnemonics.split(' ')}
                className="bg-gray-bg border border-[#E1E5F2]"
              />
            </div>
          </MnemonicsWrapper>
          <CopySection
            onClick={onCopyMnemonics}
            className="text-13 pt-16 pb-16 mt-8"
          >
            <img className="mr-6" src={IconCopy} />
            Copy seed phrase
          </CopySection>
        </div>
        <div className="text-center mt-[116px]">
          <Button
            type="primary"
            size="large"
            onClick={onSubmit}
            className="py-[13px] px-[56px] h-auto"
          >
            I've Saved the Phrase
          </Button>
        </div>
      </div>
    </div>
  );
};

export default connectStore()(DisplayMnemonic);
