import { ChevronDown, CirclePlay, Plus, Trash2 } from 'lucide-react';
import { engine } from '../../lib/engine';
import { useStudioStore } from '../../store/studio';
import { useTransport } from '../../store/transport';
import type { ArrangementBlock, Bank } from '../../lib/types';
import { cn, Dropdown, DropdownItem, IconButton } from '../ui';

const NAME_POOL = ['Intro', 'Groove', 'Breakdown', 'Drop', 'Bridge', 'Verse', 'Hook', 'Outro', 'Turnaround', 'Peak'];
const BANK_COLORS: Record<Bank, string> = {
  A: '#d6ff4d',
  B: '#a78bfa',
  C: '#5eead4',
  D: '#fb7185',
};

export function Arrangement() {
  const { project, updateProject, setBank, mode, bank } = useStudioStore();
  const { playing, sectionIndex, step, repeat } = useTransport();
  if (!project) return null;

  const arrangement: ArrangementBlock[] = project.arrangement?.length
    ? project.arrangement
    : [{ bank: 'A', repeats: 2 }];

  const nameFor = (index: number) =>
    project.sections?.[index] || NAME_POOL[index % NAME_POOL.length] || `Section ${index + 1}`;

  const jump = (index: number) => {
    setBank(arrangement[index].bank);
    if (engine.playing || playing) engine.jumpToSection(index);
  };

  const update = (index: number, patch: Partial<ArrangementBlock>) => {
    const next = arrangement.map((b, i) => (i === index ? { ...b, ...patch } : b));
    updateProject({ arrangement: next });
  };

  const remove = (index: number) => {
    if (arrangement.length <= 1) return;
    updateProject({ arrangement: arrangement.filter((_, i) => i !== index) });
  };

  const addSection = () => {
    const names = new Set(project.sections || []);
    const name = NAME_POOL.find((n) => !names.has(n)) || `Section ${arrangement.length + 1}`;
    const lastBank = arrangement[arrangement.length - 1]?.bank || 'A';
    const nextBank = (['A', 'B', 'C', 'D'] as Bank[])[(['A', 'B', 'C', 'D'] as Bank[]).indexOf(lastBank) + 1] || 'A';
    updateProject({
      arrangement: [...arrangement, { bank: nextBank, repeats: 2 }],
      sections: [...(project.sections || []), name].slice(0, 24),
    });
  };

  return (
    <div className="panel mb-3 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-700/50 px-3 py-2">
        <span className="label-mono">Arrangement</span>
        <span className="rounded border border-ink-700/70 bg-ink-800/60 px-1.5 py-px font-mono text-[9px] text-ink-500">
          {arrangement.reduce((a, b) => a + 2 * b.repeats, 0)} bars
        </span>
        <span className="hidden text-[10px] text-ink-600 sm:inline">Click a section to jump · edit repeats per block</span>
        <button
          onClick={addSection}
          className="ml-auto flex h-6 items-center gap-1 rounded-md border border-ink-700 px-2 text-[10px] text-ink-300 transition-colors hover:border-acid-300/40 hover:text-acid-300"
        >
          <Plus className="h-2.5 w-2.5" /> Add section
        </button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto p-2.5">
        {arrangement.map((block, index) => {
          const isCurrent = playing && (mode === 'song' ? sectionIndex === index : block.bank === bank);
          const progress = isCurrent ? ((repeat * 32 + step) / (32 * (block.repeats || 1))) * 100 : 0;
          const color = BANK_COLORS[block.bank];
          return (
            <div
              key={`${index}-${block.bank}`}
              className={cn(
                'group relative flex min-w-[132px] flex-1 flex-col overflow-hidden rounded-lg border transition-colors',
                isCurrent ? 'border-acid-300/50 bg-ink-800' : 'border-ink-700/70 bg-ink-850/60 hover:border-ink-600'
              )}
            >
              <button onClick={() => jump(index)} className="flex items-center gap-2 px-2.5 py-2 text-left">
                <span className="h-4 w-1 rounded-full" style={{ background: color }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-medium text-ink-200">{nameFor(index)}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[9px] text-ink-500">
                    <span className="font-mono" style={{ color }}>
                      {block.bank}
                    </span>
                    <span>·</span>
                    <span>{block.repeats}×2 bars</span>
                  </span>
                </span>
                <CirclePlay className="h-3 w-3 shrink-0 text-ink-600 group-hover:text-ink-300" />
              </button>
              <div className="flex items-center justify-between border-t border-ink-700/40 px-1.5 py-0.5">
                <Dropdown
                  align="left"
                  width="w-36"
                  trigger={
                    <button className="flex items-center gap-1 rounded px-1 py-0.5 text-[9px] text-ink-500 hover:text-ink-200">
                      {block.bank} · {block.repeats} loops <ChevronDown className="h-2 w-2" />
                    </button>
                  }
                >
                  {(close) => (
                    <>
                      {(['A', 'B', 'C', 'D'] as Bank[]).map((b) => (
                        <DropdownItem key={b} active={b === block.bank} onClick={() => { update(index, { bank: b }); close(); }}>
                          Bank {b}
                        </DropdownItem>
                      ))}
                      <div className="my-1 h-px bg-ink-700/70" />
                      {[1, 2, 3, 4].map((r) => (
                        <DropdownItem key={r} active={r === block.repeats} onClick={() => { update(index, { repeats: r }); close(); }}>
                          {r} loop{r > 1 ? 's' : ''}
                        </DropdownItem>
                      ))}
                    </>
                  )}
                </Dropdown>
                <IconButton
                  label="Remove section"
                  size="xs"
                  className="h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={() => remove(index)}
                  disabled={arrangement.length <= 1}
                >
                  <Trash2 className="h-2.5 w-2.5" />
                </IconButton>
              </div>
              <div className="h-[3px] w-full bg-ink-800">
                <div
                  className="h-full transition-[width] duration-75"
                  style={{ width: `${isCurrent ? progress : 0}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
