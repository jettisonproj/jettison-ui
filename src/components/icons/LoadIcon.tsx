import styles from "src/components/icons/LoadIcon.module.css";

interface LoadIconProps {
  className?: string;
}
function LoadIcon({ className }: LoadIconProps) {
  // todo add helper class?
  let loadIconClassName = styles.loadIcon;
  if (className != null) {
    loadIconClassName += ` ${className}`;
  }

  return (
    <div className={loadIconClassName}>
      <div className={styles.loadIcon1}></div>
      <div className={styles.loadIcon2}></div>
      <div className={styles.loadIcon3}></div>
    </div>
  );
}

export { LoadIcon };
