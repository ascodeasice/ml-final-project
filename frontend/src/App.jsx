import { Route, Switch } from "wouter";
import TitlePage from "./pages/TitlePage/TitlePage";
import UploadPage from "./pages/UploadPage/UploadPage";
import SelectPage from "./pages/SelectPage/SelectPage";
import EditPage from "./pages/EditPage/EditPage";

const App = () => (
  <>
    {/*
      Routes below are matched exclusively -
      the first matched route gets rendered
    */}
    <Switch>
      <Route path="/" component={TitlePage} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/select" component={SelectPage} />
      <Route path="/edit" component={EditPage} />
      <Route path="/result">Result</Route>
      <Route>404: No such page!</Route>
    </Switch>
  </>
);

export default App;
