import { ReactNode } from "react";
import styles from "src/components/content/Content.module.css";

interface ContentProps {
  children: ReactNode;
}

function Content({ children }: ContentProps) {
  return (
    <div className={styles.content}>{children}</div>
  );
}

export { Content };
