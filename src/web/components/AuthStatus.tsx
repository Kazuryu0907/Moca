import { AuthStatusMessage } from '@/common/types';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router';

export const AuthStatus = () => {
  const [messages, setMessages] = useState<AuthStatusMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleAuthStatus = (_event: unknown, message: AuthStatusMessage) => {
      console.log('Auth Status:', message);

      setMessages((prev) => [...prev, message]);
      setCurrentStep(message.step);

      if (message.type === 'error') {
        setHasErrors(true);
      }

      if (message.step === 'complete') {
        setIsComplete(true);
        if (message.type === 'success') {
          // 成功時は2秒後にメイン画面に遷移
          setTimeout(() => navigate('/overlay/spread'), 2000);
        }
      }
    };

    window.app.on('auth:status', handleAuthStatus);

    return () => {
      window.app.removeListener?.('auth:status', handleAuthStatus);
    };
  }, [navigate]);

  const getStepIcon = (type: AuthStatusMessage['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'progress':
        return '🔄';
      default:
        return '📝';
    }
  };

  const getStepStatus = (step: string) => {
    const stepMessage = messages.find((m) => m.step === step);
    if (!stepMessage) return 'pending';
    return stepMessage.type;
  };

  const authSteps = [
    { key: 'start', label: '認証開始' },
    { key: 'credentials', label: '認証情報読み込み' },
    { key: 'config', label: '設定ファイル読み込み' },
    { key: 'sheets', label: 'Google Sheets接続' },
    { key: 'drive', label: 'Google Drive接続' },
    { key: 'services', label: 'サービステスト' },
    { key: 'directory', label: 'ディレクトリ確認' },
    { key: 'complete', label: '完了' }
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">認証プロセス</h1>

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {authSteps.map((step, index) => {
            const status = getStepStatus(step.key);
            const isActive = currentStep === step.key;

            return (
              <div
                key={step.key}
                className={`flex flex-col items-center ${isActive ? 'scale-110' : ''} transition-transform`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${
                    status === 'success'
                      ? 'bg-green-500 text-white'
                      : status === 'error'
                        ? 'bg-red-500 text-white'
                        : status === 'progress'
                          ? 'bg-blue-500 text-white animate-pulse'
                          : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs text-center">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* プログレス線 */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-300 rounded"></div>
          <div
            className="absolute top-0 left-0 h-1 bg-blue-500 rounded transition-all duration-500"
            style={{
              width: `${((authSteps.findIndex((s) => s.key === currentStep) + 1) / authSteps.length) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* メッセージリスト */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border-l-4 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-500'
                : message.type === 'error'
                  ? 'bg-red-50 border-red-500'
                  : message.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex items-start space-x-2">
              <span className="text-lg">{getStepIcon(message.type)}</span>
              <div className="flex-1">
                <div className="font-medium">{message.message}</div>
                {message.details && message.details.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.details.map((detail, detailIndex) => (
                      <div
                        key={detailIndex}
                        className="text-sm text-gray-600 bg-white/50 p-2 rounded"
                      >
                        {detail}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* エラー時のガイダンス */}
      {hasErrors && isComplete && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">認証に失敗しました</h3>
          <p className="text-red-700 mb-3">
            以下のファイルを確認して、正しい設定を行ってください：
          </p>
          <ul className="text-sm text-red-600 space-y-1">
            <li>
              • <code>./env/credential.json</code> - Google Service
              Accountの認証情報
            </li>
            <li>
              • <code>./env/auth_config.json</code> - アプリケーション設定
            </li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            再試行
          </button>
        </div>
      )}

      {/* 成功時のメッセージ */}
      {isComplete && !hasErrors && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <h3 className="font-bold text-green-800 mb-2">
            🎉 認証が完了しました！
          </h3>
          <p className="text-green-700">まもなくメイン画面に移動します...</p>
        </div>
      )}
    </div>
  );
};
