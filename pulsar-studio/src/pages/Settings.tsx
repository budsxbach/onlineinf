import {
  CheckCircle2,
  Cpu,
  Database,
  Download,
  Eye,
  EyeOff,
  HardDrive,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Page, PageHeader } from '../components/layout/Page';
import { PageLoader } from '../components/ui';
import { Badge, Button, Field, Input, SectionHeader, Switch, cn } from '../components/ui';
import { api } from '../lib/api';
import { useSettings, useStats, useTestAi, useUpdateSettings } from '../lib/hooks';
import { timeAgo } from '../lib/format';
import { toast } from '../store/toast';

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const { data: stats } = useStats();
  const update = useUpdateSettings();
  const test = useTestAi();

  const [displayName, setDisplayName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [defaultBpm, setDefaultBpm] = useState(120);
  const [baseUrl, setBaseUrl] = useState('https://api.preview.arena.ai/v1');
  const [model, setModel] = useState('coding-router-preview');
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; models?: string[] } | null>(null);
  const [backingUp, setBackingUp] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!settings || initialized) return;
    setDisplayName(String(settings['user.displayName'] || ''));
    setStudioName(String(settings['user.studioName'] || ''));
    setDefaultBpm(Number(settings['user.defaultBpm'] || 120));
    setBaseUrl(String(settings['ai.baseUrl'] || 'https://api.preview.arena.ai/v1'));
    setModel(String(settings['ai.model'] || 'coding-router-preview'));
    setInitialized(true);
  }, [settings, initialized]);

  const hasKey = !!settings?.['ai.hasKey'];
  const envKey = !!settings?.['ai.envKey'];

  const save = () => {
    update.mutate({
      'user.displayName': displayName.trim() || 'Producer',
      'user.studioName': studioName.trim() || 'Pulsar Studio',
      'user.defaultBpm': Math.min(220, Math.max(50, defaultBpm || 120)),
      'ai.baseUrl': baseUrl.trim(),
      'ai.model': model.trim() || 'coding-router-preview',
    });
  };

  const saveKey = () => {
    const key = keyInput.trim();
    if (!key) {
      toast.error('Enter a key first');
      return;
    }
    update.mutate(
      { 'ai.apiKey': key },
      {
        onSuccess: () => {
          setKeyInput('');
          setTestResult(null);
        },
      }
    );
  };

  const removeKey = () => {
    update.mutate(
      { 'ai.apiKey': '' },
      {
        onSuccess: () => {
          setTestResult(null);
          toast.info('Arena key removed', 'The local composer will be used for new ideas.');
        },
      }
    );
  };

  const runTest = () => {
    setTestResult(null);
    test.mutate(
      { apiKey: keyInput.trim() || undefined, baseUrl: baseUrl.trim(), model: model.trim() },
      {
        onSuccess: (result) => {
          setTestResult({
            ok: true,
            message: `Connected to ${new URL(result.baseUrl).host} · ${result.modelCount} models available.`,
            models: result.models,
          });
        },
        onError: (err) => {
          setTestResult({ ok: false, message: err instanceof Error ? err.message : 'Connection failed.' });
        },
      }
    );
  };

  const downloadBackup = async () => {
    setBackingUp(true);
    try {
      const [projects, samples, presets, ideas] = await Promise.all([
        api.projects.list({}),
        api.samples.list({}),
        api.presets.list({}),
        api.ideas.list({}),
      ]);
      const fullProjects = await Promise.all(projects.map((p) => api.projects.get(p.id)));
      const payload = {
        exportedAt: new Date().toISOString(),
        app: 'Pulsar Studio',
        version: 1,
        projects: fullProjects,
        samples,
        presets,
        ideas,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pulsar-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast.success('Backup downloaded', `${fullProjects.length} projects exported as JSON.`);
    } catch (err) {
      toast.error('Backup failed', err instanceof Error ? err.message : undefined);
    } finally {
      setBackingUp(false);
    }
  };

  if (isLoading && !settings) {
    return (
      <Page>
        <PageLoader label="Loading studio settings…" />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        eyebrow={
          <>
            <span className="h-1 w-1 rounded-full bg-acid-300" /> Configuration
          </>
        }
        title="Studio settings"
        description="Connect the Arena router, tune your defaults and keep a copy of everything that lives in the local database."
        actions={
          <Button variant="primary" loading={update.isPending} onClick={save}>
            Save changes
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="panel p-4 sm:p-5">
            <SectionHeader
              title={
                <span className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-ink-400" /> Producer profile
                </span>
              }
              subtitle="Shown in the sidebar and greeting."
              className="mb-4"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name">
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} placeholder="Your name" />
              </Field>
              <Field label="Studio name">
                <Input value={studioName} onChange={(e) => setStudioName(e.target.value)} maxLength={50} placeholder="Pulsar Studio" />
              </Field>
              <Field label="Default tempo" hint="Used for new sessions and idea generation.">
                <div className="relative">
                  <Input
                    type="number"
                    min={50}
                    max={220}
                    value={defaultBpm}
                    onChange={(e) => setDefaultBpm(Number(e.target.value) || 120)}
                    className="pr-12 font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-wider text-ink-600">bpm</span>
                </div>
              </Field>
              <Field label="Theme">
                <div className="flex h-[42px] items-center gap-2 rounded-xl border border-ink-700 bg-ink-900/70 px-3">
                  <span className="h-3 w-3 rounded-full bg-ink-950 ring-1 ring-ink-600" />
                  <span className="flex-1 text-sm text-ink-300">Obsidian</span>
                  <Badge>default</Badge>
                </div>
              </Field>
            </div>
          </div>

          <div className="panel relative overflow-hidden p-4 sm:p-5">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-acid-300/[0.05] blur-3xl" />
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <SectionHeader
                title={
                  <span className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-ink-400" /> AI engine · Arena router
                  </span>
                }
                subtitle="Prompts are sent from this machine straight to Arena. Keys are stored locally."
              />
              <Badge color={hasKey ? '#d6ff4d' : '#fbbf24'} dot>
                {hasKey ? 'key configured' : envKey ? 'using env key' : 'local fallback'}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Router base URL"
                hint="OpenAI-compatible endpoint. Defaults to the Arena preview router."
                className="sm:col-span-2"
              >
                <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="font-mono text-xs" spellCheck={false} />
              </Field>
              <Field label="Model" hint="Any model exposed by your Arena key.">
                <Input value={model} onChange={(e) => setModel(e.target.value)} className="font-mono text-xs" spellCheck={false} list="arena-models" />
                <datalist id="arena-models">
                  <option value="coding-router-preview" />
                </datalist>
              </Field>
              <Field label="API key" hint={hasKey ? `Stored key ${String(settings?.['ai.keyHint'] || '')}` : 'Paste the key from platform.arena.ai'}>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder={hasKey ? 'Enter a new key to replace the stored one' : 'arena_…'}
                    className="pl-9 pr-10 font-mono text-xs"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-500 hover:text-ink-200"
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="primary" loading={update.isPending} onClick={saveKey} disabled={!keyInput.trim()} icon={<KeyRound className="h-3.5 w-3.5" />}>
                {hasKey ? 'Replace key' : 'Save key'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                loading={test.isPending}
                onClick={runTest}
                icon={test.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              >
                Test connection
              </Button>
              {hasKey && !envKey && (
                <Button size="sm" variant="ghost" onClick={removeKey}>
                  Remove key
                </Button>
              )}
              <a
                href="https://platform.arena.ai"
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex items-center gap-1 text-[10px] text-ink-500 hover:text-acid-300"
              >
                <Sparkles className="h-3 w-3" /> Get an Arena key
              </a>
            </div>

            {test.isPending && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-ink-700/60 bg-ink-800/40 px-3 py-2.5 text-[11px] text-ink-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Contacting the router and listing available models…
              </div>
            )}
            {testResult && (
              <div
                className={cn(
                  'mt-3 rounded-xl border px-3 py-2.5',
                  testResult.ok ? 'border-acid-300/25 bg-acid-300/[0.05]' : 'border-rose-500/25 bg-rose-500/[0.05]'
                )}
              >
                <div className="flex items-start gap-2">
                  {testResult.ok ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-acid-300" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
                  )}
                  <div className="min-w-0">
                    <p className={cn('text-[11px]', testResult.ok ? 'text-acid-100' : 'text-rose-200')}>{testResult.message}</p>
                    {testResult.models && testResult.models.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {testResult.models.slice(0, 6).map((m) => (
                          <span key={m} className="rounded border border-ink-700 bg-ink-900 px-1.5 py-0.5 font-mono text-[9px] text-ink-400">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-ink-700/50 bg-ink-900/40 px-3 py-2.5">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
              <p className="text-[10px] leading-relaxed text-ink-500">
                The key is written to the local SQLite database and only used by this server process to call the router. It is never
                sent to the browser after saving, and it never leaves your machine except in requests to Arena.
              </p>
            </div>
          </div>

          <div className="panel p-4 sm:p-5">
            <SectionHeader
              title={
                <span className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-ink-400" /> Studio behaviour
                </span>
              }
              subtitle="Defaults applied when you open a session."
              className="mb-4"
            />
            <div className="space-y-4">
              <Switch
                checked={!!settings?.['project.autosave']}
                onChange={(v) => update.mutate({ 'project.autosave': v })}
                label="Autosave edits"
                description="Project and pattern changes are written to the database as you work (about half a second after you stop)."
              />
              <div className="h-px bg-ink-700/60" />
              <Switch
                checked={!!settings?.['project.metronome']}
                onChange={(v) => update.mutate({ 'project.metronome': v })}
                label="Metronome on new sessions"
                description="Start the transport with a click track enabled."
              />
            </div>
          </div>

          <div className="panel p-4 sm:p-5">
            <SectionHeader
              title={
                <span className="flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-ink-400" /> Data & storage
                </span>
              }
              subtitle="Everything is persisted locally in SQLite — no cloud account required."
              className="mb-4"
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                ['Projects', stats?.totals.projects ?? '—'],
                ['Tracks', stats?.totals.tracks ?? '—'],
                ['Samples', stats?.totals.samples ?? '—'],
                ['Presets', stats?.totals.presets ?? '—'],
                ['Ideas', stats?.totals.ideas ?? '—'],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border border-ink-700/60 bg-ink-900/50 px-2.5 py-2">
                  <p className="text-[9px] uppercase tracking-wider text-ink-600">{label}</p>
                  <p className="mt-1 font-mono text-sm text-ink-100">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-ink-700/50 bg-ink-900/40 px-3 py-2.5">
              <HardDrive className="h-3.5 w-3.5 text-ink-500" />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] text-ink-300">pulsar-studio/data/pulsar.db</p>
                <p className="text-[10px] text-ink-600">
                  WAL mode · last session edit{' '}
                  {stats?.recentProjects?.[0] ? timeAgo(stats.recentProjects[0].updated_at) : '—'}
                </p>
              </div>
              <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} loading={backingUp} onClick={downloadBackup}>
                Download backup
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <p className="label-mono">Connection checklist</p>
            <div className="mt-3 space-y-2.5">
              {[
                { label: 'API key stored', ok: hasKey || envKey, hint: hasKey ? String(settings?.['ai.keyHint'] || '') : envKey ? 'from environment' : 'add a key above' },
                { label: 'Router URL', ok: !!baseUrl, hint: baseUrl.replace(/^https?:\/\//, '') },
                { label: 'Model selected', ok: !!model, hint: model },
                { label: 'Connection test', ok: !!testResult?.ok, hint: testResult ? (testResult.ok ? 'passed' : 'failed') : 'not run yet' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  {item.ok ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-acid-300" />
                  ) : (
                    <span className="mt-1 h-3 w-3 shrink-0 rounded-full border border-ink-600" />
                  )}
                  <div className="min-w-0">
                    <p className={cn('text-[11px]', item.ok ? 'text-ink-200' : 'text-ink-400')}>{item.label}</p>
                    <p className="truncate font-mono text-[9px] text-ink-600">{item.hint}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-ink-700/60 bg-ink-800/40 px-2.5 py-2 text-[10px] leading-relaxed text-ink-500">
              Without a key, the built-in composer still generates full arrangements using the same pattern engine.
            </div>
          </div>

          <div className="panel p-4">
            <p className="label-mono">Shortcuts</p>
            <div className="mt-3 space-y-2 text-[11px]">
              {[
                ['⌘ K', 'Command palette'],
                ['Space', 'Play / pause'],
                ['L', 'Loop arrangement'],
                ['M', 'Metronome'],
                ['⇧ + click', 'Cycle step velocity'],
                ['Esc', 'Close panels'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-ink-500">{label}</span>
                  <kbd className="rounded border border-ink-700 bg-ink-800 px-1.5 py-0.5 font-mono text-[9px] text-ink-300">{key}</kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="panel relative overflow-hidden p-4">
            <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-acid-300/10 blur-3xl" />
            <p className="label-mono">About</p>
            <h3 className="mt-2 text-sm font-semibold tracking-tight text-ink-100">Pulsar Studio</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
              A browser-native beat lab with a step sequencer, piano roll, drum synths, mixer and an Arena-powered co-writer.
              Built to be better than the plugins that inspired it.
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-ink-700/50 pt-2.5 text-[10px] text-ink-600">
              <span className="font-mono">v1.0.0</span>
              <span>{isLoading ? 'loading…' : 'local-first'}</span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
