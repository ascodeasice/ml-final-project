import { Route, Switch } from "wouter";
import TitlePage from "./pages/TitlePage/TitlePage";
import UploadPage from "./pages/UploadPage/UploadPage";
import ResultPage from "./pages/ResultPage/ResultPage";
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
      <Route path="/result" component={ResultPage} />
      <Route path="/edit" component={EditPage} />
      <Route>404: No such page!</Route>
    </Switch>
  </>
);

export default App;
