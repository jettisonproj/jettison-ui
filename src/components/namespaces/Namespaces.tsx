import { useContext } from "react";
import { Link } from "react-router";

import { routes } from "src/routes.ts";
import { Content } from "src/components/content/Content.tsx";
import { Header } from "src/components/header/Header.tsx";
import { NamespacesNavHeader } from "src/components/header/NavHeader.tsx";
import { NamespacesContext } from "src/providers/provider.tsx";

function Namespaces() {
  return (
    <>
      <Header />
      <Content>
        <NamespacesNavHeader />
        <NamespacesList />
      </Content>
    </>
  );
}

function NamespacesList() {
  const namespaces = useContext(NamespacesContext);

  if (namespaces == null) {
    return <i className="nf nf-fa-spinner" />;
  }

  return (
    <ul>
      {Object.keys(namespaces)
        .sort()
        .map((namespace) => (
          <li key={namespace}>
            <Link to={`${routes.flows}/${namespace}`}>{namespace}</Link>
          </li>
        ))}
    </ul>
  );
}

export { Namespaces };
