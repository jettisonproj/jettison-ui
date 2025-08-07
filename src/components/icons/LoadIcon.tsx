import styles from "src/components/icons/LoadIcon.module.css";

interface LoadIconProps {
  className?: string;
}
function LoadIcon({ className }: LoadIconProps) {
  return (
    <div className={`${styles.loadIcon} ${className}`}>
      <div className={styles.loadIcon1}></div>
      <div className={styles.loadIcon2}></div>
      <div className={styles.loadIcon3}></div>
    </div>
  );
}

export { LoadIcon };
