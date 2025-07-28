import { CrawlResult, CrawlStatus } from '../types/CrawlResult';
import { EventEmitter } from 'events';

// Events, die vom ProgressMonitor emittiert werden
export enum ProgressEvent {
  START = 'start',
  PROGRESS = 'progress',
  COMPLETE = 'complete',
  ERROR = 'error'
}

// Interface für den Fortschritt
export interface Progress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
  skipped: number;
  pending: number;
  percentComplete: number;
  elapsedTime: number;
  estimatedTimeRemaining: number | null;
  startTime: Date;
  currentTime: Date;
}

export class ProgressMonitor extends EventEmitter {
  private total: number = 0;
  private completed: number = 0;
  private successful: number = 0;
  private failed: number = 0;
  private skipped: number = 0;
  private startTime: Date | null = null;
  private lastUpdateTime: Date | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private results: CrawlResult[] = [];
  
  constructor(updateIntervalMs: number = 1000) {
    super();
    
    // Regelmäßige Updates starten, wenn der Monitor gestartet wird
    this.on(ProgressEvent.START, () => {
      this.updateInterval = setInterval(() => {
        this.emitProgress();
      }, updateIntervalMs);
    });
    
    // Updates stoppen, wenn der Monitor abgeschlossen ist
    this.on(ProgressEvent.COMPLETE, () => {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    });
  }
  
  /**
   * Startet den Monitor
   */
  start(total: number): void {
    this.total = total;
    this.completed = 0;
    this.successful = 0;
    this.failed = 0;
    this.skipped = 0;
    this.startTime = new Date();
    this.lastUpdateTime = new Date();
    this.results = [];
    
    this.emit(ProgressEvent.START, this.getProgress());
  }
  
  /**
   * Aktualisiert den Fortschritt mit einem neuen Ergebnis
   */
  update(result: CrawlResult): void {
    this.completed++;
    this.lastUpdateTime = new Date();
    this.results.push(result);
    
    // Zähler aktualisieren
    switch (result.status) {
      case 'success':
        this.successful++;
        break;
      case 'failed':
        this.failed++;
        break;
      case 'skipped':
        this.skipped++;
        break;
    }
    
    this.emitProgress();
    
    // Prüfen, ob alle Websites verarbeitet wurden
    if (this.completed >= this.total) {
      this.complete();
    }
  }
  
  /**
   * Markiert den Monitor als abgeschlossen
   */
  complete(): void {
    this.emit(ProgressEvent.COMPLETE, this.getProgress(), this.results);
  }
  
  /**
   * Meldet einen Fehler
   */
  error(error: Error): void {
    this.emit(ProgressEvent.ERROR, error);
  }
  
  /**
   * Gibt den aktuellen Fortschritt zurück
   */
  getProgress(): Progress {
    if (!this.startTime) {
      this.startTime = new Date();
    }
    
    const currentTime = new Date();
    const elapsedTime = (currentTime.getTime() - this.startTime.getTime()) / 1000; // in Sekunden
    
    // Geschätzte verbleibende Zeit berechnen
    let estimatedTimeRemaining: number | null = null;
    
    if (this.completed > 0) {
      const timePerItem = elapsedTime / this.completed;
      estimatedTimeRemaining = timePerItem * (this.total - this.completed);
    }
    
    return {
      total: this.total,
      completed: this.completed,
      successful: this.successful,
      failed: this.failed,
      skipped: this.skipped,
      pending: this.total - this.completed,
      percentComplete: this.total > 0 ? (this.completed / this.total) * 100 : 0,
      elapsedTime,
      estimatedTimeRemaining,
      startTime: this.startTime,
      currentTime
    };
  }
  
  /**
   * Emittiert ein Fortschritts-Event
   */
  private emitProgress(): void {
    this.emit(ProgressEvent.PROGRESS, this.getProgress());
  }
  
  /**
   * Gibt alle Ergebnisse zurück
   */
  getResults(): CrawlResult[] {
    return this.results;
  }
}
