import { ButtonBuilder, ButtonStyle } from "discord.js";

export function GenerateButtonPrevNext(disablePrev: boolean, disableNext: boolean) {
  return [
    new ButtonBuilder({
      customId: 'prev',
      label: '◀',
      style: ButtonStyle.Primary,
      disabled: disablePrev
    }),
    new ButtonBuilder({
      customId: 'next',
      label: '▶',
      style: ButtonStyle.Primary,
      disabled: disableNext
    })
  ];
}