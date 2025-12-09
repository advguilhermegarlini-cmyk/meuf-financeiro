import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { HealthSettings } from '../types';
import { Card, Button } from './Layout';
import { Activity, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { formatCurrency } from '../utils';

const DEFAULT_HEALTH_SETTINGS: HealthSettings = {
  criticalThreshold: -500,
  attentionThreshold: 0,
  moderateThreshold: 1000,
  goodThreshold: 2000,
};

interface HealthLevel {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  description: string;
}

const HEALTH_LEVELS: Record<string, HealthLevel> = {
  critical: {
    label: 'Crítico',
    color: '#FF0000',
    bgColor: '#FF0000',
    borderColor: '#FF0000',
    icon: '🔴',
    description: 'Saldo muito negativo - situação crítica',
  },
  attention: {
    label: 'Atenção',
    color: '#FF6F91',
    bgColor: '#FF6F91',
    borderColor: '#FF6F91',
    icon: '🟠',
    description: 'Saldo negativo - requer atenção',
  },
  moderate: {
    label: 'Moderado',
    color: '#FFA500',
    bgColor: '#FFA500',
    borderColor: '#FFA500',
    icon: '🟡',
    description: 'Saldo baixo mas positivo',
  },
  good: {
    label: 'Bom',
    color: '#90EE90',
    bgColor: '#90EE90',
    borderColor: '#90EE90',
    icon: '🟢',
    description: 'Saldo adequado',
  },
  excellent: {
    label: 'Excelente',
    color: '#006400',
    bgColor: '#006400',
    borderColor: '#006400',
    icon: '🟢',
    description: 'Saldo muito bom',
  },
};

export const FinancialHealthSettings: React.FC = () => {
  const { user, updateUserProfile } = useApp();
  const [settings, setSettings] = useState<HealthSettings>(DEFAULT_HEALTH_SETTINGS);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [previewBalance, setPreviewBalance] = useState(0);

  useEffect(() => {
    if (user?.healthSettings) {
      setSettings(user.healthSettings);
    }
  }, [user]);

  const getHealthStatus = (balance: number): keyof typeof HEALTH_LEVELS => {
    if (balance < settings.criticalThreshold) return 'critical';
    if (balance < settings.attentionThreshold) return 'attention';
    if (balance < settings.moderateThreshold) return 'moderate';
    if (balance < settings.goodThreshold) return 'good';
    return 'excellent';
  };

  const handleSave = async () => {
    try {
      // Save health settings to user profile
      await updateUserProfile(user?.displayName || '', user?.email || '', settings);
      setMessage('Configurações de saúde financeira atualizadas com sucesso!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erro ao atualizar configurações.');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_HEALTH_SETTINGS);
    setMessage('Configurações restauradas para padrão.');
    setMessageType('success');
    setTimeout(() => setMessage(''), 3000);
  };

  const currentStatus = getHealthStatus(previewBalance);
  const statusInfo = HEALTH_LEVELS[currentStatus];

  return (
    <div className="space-y-6 pt-4 border-t border-github-border">
      <div className="flex items-start gap-3">
        <Activity size={24} className="text-github-primary flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-github-text mb-1">Saúde Financeira</h3>
          <p className="text-sm text-github-muted">
            Customize os limites que definem cada nível de saúde financeira. Ajuste conforme sua realidade.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border ${
            messageType === 'success'
              ? 'bg-github-success/20 text-github-success border-github-success'
              : 'bg-github-danger/20 text-github-danger border-github-danger'
          }`}
        >
          {message}
        </div>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-github-primary/5 border border-github-primary/30">
        <div className="flex gap-3">
          <Info size={20} className="text-github-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-github-text">
            <p className="font-medium mb-2">Como funciona?</p>
            <ul className="space-y-1 text-github-muted text-xs">
              <li>• <strong>Crítico:</strong> Saldo menor que {formatCurrency(settings.criticalThreshold)}</li>
              <li>• <strong>Atenção:</strong> Saldo entre {formatCurrency(settings.criticalThreshold)} e {formatCurrency(settings.attentionThreshold)}</li>
              <li>• <strong>Moderado:</strong> Saldo entre {formatCurrency(settings.attentionThreshold)} e {formatCurrency(settings.moderateThreshold)}</li>
              <li>• <strong>Bom:</strong> Saldo entre {formatCurrency(settings.moderateThreshold)} e {formatCurrency(settings.goodThreshold)}</li>
              <li>• <strong>Excelente:</strong> Saldo maior que {formatCurrency(settings.goodThreshold)}</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Critical Threshold */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔴</span>
            <div>
              <h4 className="font-semibold text-github-text">Nível Crítico</h4>
              <p className="text-xs text-github-muted">Saldo muito negativo</p>
            </div>
          </div>
          <input
            type="number"
            value={settings.criticalThreshold}
            onChange={(e) => setSettings({ ...settings, criticalThreshold: parseFloat(e.target.value) })}
            className="w-full bg-github-bg border border-github-border rounded-lg p-3 text-github-text outline-none focus:border-github-primary text-sm"
            placeholder="Valor em reais"
          />
          <p className="text-xs text-github-muted">Exemplo: -500 (saldo menor que -500 é crítico)</p>
        </Card>

        {/* Attention Threshold */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟠</span>
            <div>
              <h4 className="font-semibold text-github-text">Nível Atenção</h4>
              <p className="text-xs text-github-muted">Saldo negativo</p>
            </div>
          </div>
          <input
            type="number"
            value={settings.attentionThreshold}
            onChange={(e) => setSettings({ ...settings, attentionThreshold: parseFloat(e.target.value) })}
            className="w-full bg-github-bg border border-github-border rounded-lg p-3 text-github-text outline-none focus:border-github-primary text-sm"
            placeholder="Valor em reais"
          />
          <p className="text-xs text-github-muted">Exemplo: 0 (saldo entre crítico e 0)</p>
        </Card>

        {/* Moderate Threshold */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟡</span>
            <div>
              <h4 className="font-semibold text-github-text">Nível Moderado</h4>
              <p className="text-xs text-github-muted">Saldo baixo positivo</p>
            </div>
          </div>
          <input
            type="number"
            value={settings.moderateThreshold}
            onChange={(e) => setSettings({ ...settings, moderateThreshold: parseFloat(e.target.value) })}
            className="w-full bg-github-bg border border-github-border rounded-lg p-3 text-github-text outline-none focus:border-github-primary text-sm"
            placeholder="Valor em reais"
          />
          <p className="text-xs text-github-muted">Exemplo: 1000 (saldo entre 0 e 1000)</p>
        </Card>

        {/* Good Threshold */}
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🟢</span>
            <div>
              <h4 className="font-semibold text-github-text">Nível Bom/Excelente</h4>
              <p className="text-xs text-github-muted">Saldo adequado ou muito bom</p>
            </div>
          </div>
          <input
            type="number"
            value={settings.goodThreshold}
            onChange={(e) => setSettings({ ...settings, goodThreshold: parseFloat(e.target.value) })}
            className="w-full bg-github-bg border border-github-border rounded-lg p-3 text-github-text outline-none focus:border-github-primary text-sm"
            placeholder="Valor em reais"
          />
          <p className="text-xs text-github-muted">Exemplo: 2000 (bom entre 1000 e 2000; excelente acima)</p>
        </Card>
      </div>

      {/* Preview Section */}
      <Card className="p-5 bg-github-surface/50 space-y-4">
        <h4 className="font-semibold text-github-text flex items-center gap-2">
          <TrendingUp size={18} /> Pré-visualização
        </h4>
        <p className="text-sm text-github-muted">
          Mova o saldo abaixo para ver como a saúde financeira muda em tempo real:
        </p>

        {/* Preview Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-github-text">Saldo Simulado</label>
            <span className="text-lg font-bold text-github-primary">{formatCurrency(previewBalance)}</span>
          </div>
          <input
            type="range"
            min={-2000}
            max={5000}
            step={100}
            value={previewBalance}
            onChange={(e) => setPreviewBalance(parseFloat(e.target.value))}
            className="w-full h-2 bg-github-border rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-github-muted">
            <span>-2.000</span>
            <span>0</span>
            <span>5.000</span>
          </div>
        </div>

        {/* Status Display */}
        <div className="mt-4 p-4 rounded-lg border-2" style={{ borderColor: statusInfo.color }}>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl flex-shrink-0"
              style={{ backgroundColor: `${statusInfo.bgColor}33` }}
            >
              {statusInfo.icon}
            </div>
            <div>
              <p className="font-bold text-lg text-github-text">{statusInfo.label}</p>
              <p className="text-sm text-github-muted">{statusInfo.description}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4">
        <Button onClick={handleReset} variant="secondary">
          Restaurar Padrão
        </Button>
        <Button onClick={handleSave} variant="primary">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};
