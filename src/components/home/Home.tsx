import { Content } from "src/components/content/Content.tsx"
import { Header } from "src/components/header/Header.tsx"

function Home() {
  return (
    <>
      <Header />
      <Content title='Home'>
        <p>This is the HOME page</p>
      </Content>
    </>
  );
}

export { Home };
