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
      {Array.from(namespaces)
        .sort()
        .map((namespace) => (
          <li key={namespace}>
            <Link to={`${routes.flows}/${namespace}`}>{namespace}</Link>{" "}
            <a
              href={`http://osoriano.com:2846/api/v1/namespaces/${namespace}`}
              target="_blank"
              rel="noreferrer"
            >
              <i className="nf nf-fa-file_text_o" />
            </a>
          </li>
        ))}
    </ul>
  );
}

export { Namespaces };
