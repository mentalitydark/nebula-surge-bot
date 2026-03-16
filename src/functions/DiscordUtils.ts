export class DiscordUtils {
  public static formatTimestamp(date: Date): string {
    return `<t:${Math.floor(date.getTime() / 1000)}>`;
  }

  public static formatRelativeTimestamp(date: Date): string {
    return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
  }
}