import { useContext } from "react";
import { Link } from "react-router";

import { routes } from "src/routes.ts";
import { Header } from "src/components/header/Header.tsx";
import { NamespacesNavHeader } from "src/components/header/NavHeader.tsx";
import { NamespacesContext } from "src/providers/provider.tsx";
import styles from "src/components/namespaces/Namespaces.module.css";

function Namespaces() {
  return (
    <>
      <Header />
      <NamespacesNavHeader />
      <NamespacesList />
    </>
  );
}

function NamespacesList() {
  const namespaces = useContext(NamespacesContext);

  if (namespaces == null) {
    return <i className="nf nf-fa-spinner" />;
  }

  return Array.from(namespaces)
    .sort()
    .map((namespace, index) => (
      <Namespace key={namespace} isFirst={index === 0} namespace={namespace} />
    ));
}

interface NamespaceProps {
  namespace: string;
  isFirst: boolean;
}
function Namespace({ namespace, isFirst }: NamespaceProps) {
  let namespaceClassName = styles.namespace;
  if (namespaceClassName == null) {
    throw new NamespacesError("Failed to find namespace style");
  }
  if (isFirst) {
    namespaceClassName += ` ${styles.namespaceFirst}`;
  }
  return (
    <div className={namespaceClassName}>
      <Link
        to={`${routes.flows}/${namespace}`}
        className={styles.namespaceLink}
      ></Link>
      {namespace}
      <a
        className={styles.manifestLink}
        href={`http://osoriano.com:2846/api/v1/namespaces/${namespace}`}
        target="_blank"
        rel="noreferrer"
      >
        <i className="nf nf-fa-file_text_o" />
      </a>
    </div>
  );
}

class NamespacesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Namespaces };
