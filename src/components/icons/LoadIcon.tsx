import styles from "src/components/icons/LoadIcon.module.css";
import { concatOptionalStyle } from "src/utils/styleUtil.ts";

interface LoadIconProps {
  className?: string;
}
function LoadIcon({ className }: LoadIconProps) {
  return (
    <div className={concatOptionalStyle(styles.loadIcon, className)}>
      <div className={styles.loadIcon1}></div>
      <div className={styles.loadIcon2}></div>
      <div className={styles.loadIcon3}></div>
    </div>
  );
}

export { LoadIcon };
