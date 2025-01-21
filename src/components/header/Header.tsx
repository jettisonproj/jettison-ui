import jettisonLogo from "/jettison.svg";
import styles from "src/components/header/Header.module.css"

function Header() {
  return (
    <header className={styles.container}>
      <img src={jettisonLogo} className={styles.logo} alt="Jettison logo"/>
      <span className={styles.logoName}>JETTISON</span>
      <i className={`fa fa-lg fa-globe ${styles.headerIcon}`} />
      <i className={`fa fa-lg fa-user  ${styles.headerIcon}`} />
    </header>
  );
}

export { Header };

