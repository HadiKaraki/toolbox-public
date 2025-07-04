// import { ChildProcess } from 'child_process';
import { FfmpegCommand } from 'fluent-ffmpeg';

class FFmpegManager {
  private activeProcesses: Map<string, FfmpegCommand> = new Map();

  addProcess(taskId: string, command: FfmpegCommand) {
    this.activeProcesses.set(taskId, command);
  }

  cancelProcess(taskId: string) {
    const command = this.activeProcesses.get(taskId);
    if (command) {
      command.kill('SIGTERM'); // ✅ .kill() works on FfmpegCommand
      this.activeProcesses.delete(taskId);
      return true;
    }
    return false;
  }

  cleanup() {
    this.activeProcesses.forEach(command => command.kill('SIGTERM'));
    this.activeProcesses.clear();
  }
}

export const ffmpegManager = new FFmpegManager();