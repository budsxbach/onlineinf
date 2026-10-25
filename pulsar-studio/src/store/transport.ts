import { create } from 'zustand';
import { engine } from '../lib/engine';
import type { Bank } from '../lib/types';

interface TransportState {
  playing: boolean;
  step: number;
  sectionIndex: number;
  repeat: number;
  bank: Bank;
  loop: boolean;
  metronome: boolean;
}

export const useTransport = create<TransportState>(() => ({
  playing: false,
  step: 0,
  sectionIndex: 0,
  repeat: 0,
  bank: 'A',
  loop: true,
  metronome: false,
}));

engine.onPosition = (pos) => {
  useTransport.setState({
    playing: pos.playing,
    step: pos.step,
    sectionIndex: pos.sectionIndex,
    repeat: pos.repeat,
    bank: pos.bank,
  });
};

export const transport = {
  play: () => {
    engine.play();
    useTransport.setState({ playing: true });
  },
  pause: () => {
    engine.pause();
    useTransport.setState({ playing: false });
  },
  toggle: () => {
    if (engine.playing) transport.pause();
    else transport.play();
  },
  stop: () => {
    engine.stop();
    useTransport.setState({ playing: false, step: 0, sectionIndex: 0, repeat: 0 });
  },
  setLoop: (loop: boolean) => {
    engine.setLoop(loop);
    useTransport.setState({ loop });
  },
  setMetronome: (on: boolean) => {
    engine.setMetronome(on);
    useTransport.setState({ metronome: on });
  },
};
