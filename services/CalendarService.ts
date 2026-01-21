import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

export interface BusyBlock {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

export interface DailyAvailability {
  date: Date;
  busyBlocks: BusyBlock[];
  totalBusyMinutes: number;
  totalFreeMinutes: number;
  longestFreeBlock: number;
  hasPermission: boolean;
  isWebFallback: boolean;
}

export interface CalendarPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

class CalendarService {
  private permissionStatus: CalendarPermissionStatus = {
    granted: false,
    canAskAgain: true,
  };

  private readonly WAKING_HOURS_START = 6;
  private readonly WAKING_HOURS_END = 22;
  private readonly TOTAL_WAKING_MINUTES = (this.WAKING_HOURS_END - this.WAKING_HOURS_START) * 60;

  async requestPermissions(): Promise<CalendarPermissionStatus> {
    if (Platform.OS === 'web') {
      console.log('[CalendarService] Web platform - using mock data');
      this.permissionStatus = { granted: false, canAskAgain: false };
      return this.permissionStatus;
    }

    try {
      const { status, canAskAgain } = await Calendar.requestCalendarPermissionsAsync();
      this.permissionStatus = {
        granted: status === 'granted',
        canAskAgain: canAskAgain ?? true,
      };
      console.log('[CalendarService] Permission status:', this.permissionStatus);
      return this.permissionStatus;
    } catch (error) {
      console.error('[CalendarService] Permission request failed:', error);
      this.permissionStatus = { granted: false, canAskAgain: false };
      return this.permissionStatus;
    }
  }

  async checkPermissions(): Promise<CalendarPermissionStatus> {
    if (Platform.OS === 'web') {
      return { granted: false, canAskAgain: false };
    }

    try {
      const { status, canAskAgain } = await Calendar.getCalendarPermissionsAsync();
      this.permissionStatus = {
        granted: status === 'granted',
        canAskAgain: canAskAgain ?? true,
      };
      return this.permissionStatus;
    } catch (error) {
      console.error('[CalendarService] Permission check failed:', error);
      return { granted: false, canAskAgain: false };
    }
  }

  async getAvailability(date: Date = new Date()): Promise<DailyAvailability> {
    const startOfDay = new Date(date);
    startOfDay.setHours(this.WAKING_HOURS_START, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(this.WAKING_HOURS_END, 0, 0, 0);

    const now = new Date();
    const effectiveStart = now > startOfDay ? now : startOfDay;

    if (Platform.OS === 'web' || !this.permissionStatus.granted) {
      console.log('[CalendarService] Using fallback availability (web or no permission)');
      return this.getMockAvailability(date, effectiveStart, endOfDay);
    }

    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const calendarIds = calendars
        .filter(cal => cal.allowsModifications !== false)
        .map(cal => cal.id);

      if (calendarIds.length === 0) {
        console.log('[CalendarService] No calendars found');
        return this.getEmptyAvailability(date, effectiveStart, endOfDay);
      }

      const events = await Calendar.getEventsAsync(
        calendarIds,
        startOfDay,
        endOfDay
      );

      const busyBlocks: BusyBlock[] = events
        .filter(event => !event.allDay)
        .map(event => ({
          startTime: new Date(event.startDate),
          endTime: new Date(event.endDate),
          durationMinutes: Math.round(
            (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / 60000
          ),
        }))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      const mergedBlocks = this.mergeBusyBlocks(busyBlocks);
      const totalBusyMinutes = mergedBlocks.reduce((sum, block) => sum + block.durationMinutes, 0);
      
      const remainingMinutes = Math.max(0, 
        Math.round((endOfDay.getTime() - effectiveStart.getTime()) / 60000)
      );
      
      const totalFreeMinutes = Math.max(0, remainingMinutes - totalBusyMinutes);
      const longestFreeBlock = this.calculateLongestFreeBlock(mergedBlocks, effectiveStart, endOfDay);

      console.log('[CalendarService] Availability calculated:', {
        busyBlocks: mergedBlocks.length,
        totalBusyMinutes,
        totalFreeMinutes,
        longestFreeBlock,
      });

      return {
        date,
        busyBlocks: mergedBlocks,
        totalBusyMinutes,
        totalFreeMinutes,
        longestFreeBlock,
        hasPermission: true,
        isWebFallback: false,
      };
    } catch (error) {
      console.error('[CalendarService] Failed to fetch events:', error);
      return this.getEmptyAvailability(date, effectiveStart, endOfDay);
    }
  }

  private mergeBusyBlocks(blocks: BusyBlock[]): BusyBlock[] {
    if (blocks.length === 0) return [];

    const merged: BusyBlock[] = [];
    let current = { ...blocks[0] };

    for (let i = 1; i < blocks.length; i++) {
      const next = blocks[i];
      if (next.startTime <= current.endTime) {
        current.endTime = new Date(Math.max(current.endTime.getTime(), next.endTime.getTime()));
        current.durationMinutes = Math.round(
          (current.endTime.getTime() - current.startTime.getTime()) / 60000
        );
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
    merged.push(current);

    return merged;
  }

  private calculateLongestFreeBlock(busyBlocks: BusyBlock[], start: Date, end: Date): number {
    if (busyBlocks.length === 0) {
      return Math.round((end.getTime() - start.getTime()) / 60000);
    }

    let longest = 0;
    let currentStart = start;

    for (const block of busyBlocks) {
      if (block.startTime > currentStart) {
        const freeMinutes = Math.round((block.startTime.getTime() - currentStart.getTime()) / 60000);
        longest = Math.max(longest, freeMinutes);
      }
      currentStart = new Date(Math.max(currentStart.getTime(), block.endTime.getTime()));
    }

    if (currentStart < end) {
      const freeMinutes = Math.round((end.getTime() - currentStart.getTime()) / 60000);
      longest = Math.max(longest, freeMinutes);
    }

    return longest;
  }

  private getMockAvailability(date: Date, effectiveStart: Date, endOfDay: Date): DailyAvailability {
    const hour = new Date().getHours();
    
    let mockFreeMinutes: number;
    if (hour >= 17) {
      mockFreeMinutes = 45;
    } else if (hour >= 12) {
      mockFreeMinutes = 90;
    } else {
      mockFreeMinutes = 180;
    }

    return {
      date,
      busyBlocks: [],
      totalBusyMinutes: this.TOTAL_WAKING_MINUTES - mockFreeMinutes,
      totalFreeMinutes: mockFreeMinutes,
      longestFreeBlock: mockFreeMinutes,
      hasPermission: false,
      isWebFallback: true,
    };
  }

  private getEmptyAvailability(date: Date, effectiveStart: Date, endOfDay: Date): DailyAvailability {
    const totalFreeMinutes = Math.max(0, 
      Math.round((endOfDay.getTime() - effectiveStart.getTime()) / 60000)
    );

    return {
      date,
      busyBlocks: [],
      totalBusyMinutes: 0,
      totalFreeMinutes,
      longestFreeBlock: totalFreeMinutes,
      hasPermission: this.permissionStatus.granted,
      isWebFallback: false,
    };
  }

  formatFreeTime(minutes: number): string {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }

  getWorkoutRecommendation(freeMinutes: number): {
    canWorkout: boolean;
    suggestedDuration: number;
    message: string;
  } {
    if (freeMinutes < 20) {
      return {
        canWorkout: false,
        suggestedDuration: 0,
        message: 'No time for a workout today. Consider a 5-minute stretch.',
      };
    } else if (freeMinutes < 45) {
      return {
        canWorkout: true,
        suggestedDuration: 20,
        message: 'Tight schedule. Quick 20-minute session recommended.',
      };
    } else if (freeMinutes < 75) {
      return {
        canWorkout: true,
        suggestedDuration: 45,
        message: 'Standard session fits your schedule.',
      };
    } else {
      return {
        canWorkout: true,
        suggestedDuration: 60,
        message: 'Full session available. Make it count.',
      };
    }
  }
}

export const calendarService = new CalendarService();
