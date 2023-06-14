"use client";

import { NextPage } from "next";
import { initFirebase } from "../../../firebase/firebaseApp";

const Dashboard: NextPage = () => {
  return (
    <main>
      <h1>Hello from Second Page</h1>
    </main>
  );
};

export default Dashboard;
