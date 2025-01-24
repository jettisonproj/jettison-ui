import { ReactNode } from "react";
import styles from "src/components/content/Content.module.css";

interface ContentProps {
  children: ReactNode;
}

function Content({ children }: ContentProps) {
  return (
    <div className={styles.container}>
      <div className={styles.panel}>{children}</div>
    </div>
  );
}

export { Content };
