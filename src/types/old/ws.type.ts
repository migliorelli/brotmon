import WebSocket from "ws";
import { Trainer } from "./trainer.type";

export type WsEventCallback = (...args: any) => void;

export type WsEventOptions = {
  event: string;
  once?: boolean;
};

export type WsEvent = {
  options: WsEventOptions;
  handler: WsEventCallback;
};

export type WsEvents = Record<string, WsEventCallback>;

export type ClientListenEvent = {
  event: string;
  handler: WsEventCallback;
};

export type MessageEvent = [event: string, ...data: any];

export type Config = {
  id?: string;
  options: WebSocket.ClientOptions;
};

export type ServerEmitEvents = {};
export type ServerListenEvents = {};

export type ClientEmitEvents = {};

export type ClientListenEvents = {
  "turn:passed": (log: string, host: Trainer, guest: Trainer) => void;

  "user:connected": (log: string, user: Trainer, isHost: boolean) => void;
  "user:disconnected": (log: string, user: Trainer, isHost: boolean) => void;

  "battle:started": (log: string, host: Trainer, guest: Trainer) => void;
  "battle:ended": (log: string, winner: string) => void;
};
