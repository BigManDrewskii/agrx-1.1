/**
 * useMarketStatus — Check if ATHEX (Athens Stock Exchange) is currently open
 *
 * ATHEX Trading Hours:
 * - Monday-Friday: 10:00 - 17:00 Athens time (EET/EEST)
 * - Saturday-Sunday: Closed
 *
 * @returns Object with isMarketOpen boolean
 *
 * Usage:
 *   const { isMarketOpen } = useMarketStatus();
 */
import { useMemo } from "react";

interface MarketStatusResult {
  isMarketOpen: boolean;
}

export function useMarketStatus(): MarketStatusResult {
  const isMarketOpen = useMemo(() => {
    const now = new Date();

    // Get current time in Athens timezone
    const athensTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Athens" })
    );

    // Check if it's a weekday (Monday=1, Friday=5)
    const isWeekday = athensTime.getDay() >= 1 && athensTime.getDay() <= 5;

    // Get current hour in Athens (0-23)
    const athensHour = athensTime.getHours();

    // ATHEX is open 10:00-17:00 on weekdays
    return isWeekday && athensHour >= 10 && athensHour < 17;
  }, []); // Empty deps - recalculates on every render for time-based status

  return { isMarketOpen };
}
