import { Link } from "react-router";

import { routes } from "src/routes.ts";
import jettisonLogo from "/jettison.svg";
import styles from "src/components/header/Header.module.css";

function Header() {
  return (
    <header className={styles.container}>
      <Link to={routes.home}>
        <img src={jettisonLogo} className={styles.logo} alt="Jettison logo" />
        <span className={styles.logoName}>JETTISON</span>
      </Link>
      <i className={`fa fa-lg fa-globe ${styles.headerIcon}`} />
      <i className={`fa fa-lg fa-user  ${styles.headerIcon}`} />
    </header>
  );
}

export { Header };
