import { Link } from "react-router";

import { routes } from "src/routes.ts";
import { namespaces } from "src/data/data.ts";
import { Content } from "src/components/content/Content.tsx";
import { Header } from "src/components/header/Header.tsx";
import { NamespacesNavHeader } from "src/components/header/NavHeader.tsx";

function Namespaces() {
  return (
    <>
      <Header />
      <Content>
        <NamespacesNavHeader />
        <ul>
          {namespaces.map((namespace) => (
            <li key={namespace}>
              <Link to={`${routes.flows}/${namespace}`}>{namespace}</Link>
            </li>
          ))}
        </ul>
      </Content>
    </>
  );
}

export { Namespaces };
