import type { JSX } from "react";

import styles from "src/components/header/NavHeaderNotificationBadge.module.css";

interface NavHeaderNotificationBadgeProps {
  numNotifications: number;
}
function NavHeaderNotificationBadge({
  numNotifications,
}: NavHeaderNotificationBadgeProps): JSX.Element | null {
  if (numNotifications <= 0) {
    return null;
  }
  return (
    <span className={styles.navHeaderNotificationBadge}>
      {numNotifications}
    </span>
  );
}

export { NavHeaderNotificationBadge };
