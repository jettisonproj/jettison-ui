import { ReactNode} from 'react'
import styles from "src/components/content/Content.module.css"

interface ContentProps {
  title: string;
  children: ReactNode;
}

function Content({ title, children }: ContentProps) {
  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.title}>
          <h1>{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

export { Content };
