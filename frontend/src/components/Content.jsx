import { Routes, Route, Navigate } from "react-router-dom";
import Home from '../pages/Home';
import Chat from '../pages/Chat';

function Content() {
  return(
    <div id='content'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:id" element={<Chat />} />
      </Routes>
    </div>
  )
}

export default Content;