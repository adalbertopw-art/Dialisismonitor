/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import PatientDetail from "@/pages/PatientDetail";
import PreDialysisForm from "@/pages/PreDialysisForm";
import Layout from "@/components/Layout";
import { DisclaimerModal } from "@/components/DisclaimerModal";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        <Layout>
          <DisclaimerModal />
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/paciente/:id" component={PatientDetail} />
            <Route path="/paciente/:id/pre-dialisis" component={PreDialysisForm} />
            <Route>404 Page Not Found</Route>
          </Switch>
        </Layout>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
