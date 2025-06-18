import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Browser } from "./Brower";
import { IdTable } from "./IdTable";
import { Overlay } from "./Overlay";
import { Teams } from "./Teams";

const selectedCSS = "bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-700 font-semibold";
const unSelectedCSS = "bg-white inline-block py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold";
const Bar = ({
  title,
  relativePath,
}: {
  title: string;
  relativePath: string;
}) => {
  return (
    <li className="-mb-px mr-1">
      <NavLink
        className={({ isActive }) => (isActive ? selectedCSS : unSelectedCSS)}
        to={`/overlay/${relativePath}`}
      >
        {title}
      </NavLink>
    </li>
  );
};

export const Topper = () => {
  console.log(useLocation());
  return (
    <div>
      <ul className="flex border-b">
        <Bar title="Remote Controller" relativePath="browser" />
        <Bar title="SpreadSheet" relativePath="spread" />
        <Bar title="Google Drive" relativePath="drive" />
        <Bar title="Debug" relativePath="debug" />
      </ul>
      <Outlet />
    </div>
  );
};

export const Main = () => {
  return (
    <div>
      <Topper />
      <Routes>
        <Route path="/browser" element={<Browser />} />
        <Route
          path="/spread"
          element={
            <>
              <Teams />
              <IdTable />
            </>
          }
        />
        <Route path="/drive" element={<Overlay />} />
      </Routes>
    </div>
  );
};
