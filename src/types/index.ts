import type {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  ContextMenuCommandBuilder,
  ChatInputCommandInteraction,
  MessageContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
  ClientEvents,
} from "discord.js";

export type AnyInteraction =
  | ChatInputCommandInteraction
  | MessageContextMenuCommandInteraction
  | UserContextMenuCommandInteraction;

export type CommandData =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | SlashCommandOptionsOnlyBuilder
  | ContextMenuCommandBuilder;

export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}

export interface Command<T extends AnyInteraction = ChatInputCommandInteraction> {
  data: CommandData;
  execute: (interaction: T) => Promise<void>;
}

export interface TranslateResult {
  translatedText: string;
  detectedSource: string;
}

export interface TranslateEmbedOptions {
  from: string;
  to: string;
  result: string;
}