import React, { useState, useEffect } from "react";
import "./App.css";
import useSocket from "use-socket.io-client";
import { useImmer } from "use-immer";
import { animateScroll } from "react-scroll";

const Messages = props => {
  let id = props.id;
  console.log(id);

  return props.data.map(m =>
    m[0] !== "" ? (
      <li key={m[0]}>
        {id === m[0] ? (
          <div className="rounded-full py-2 px-4 bg-blue-200 w-auto inline-block text-xs mt-1 ">
            <strong>{m[0]}</strong> : {m[1]}
          </div>
        ) : (
          <div className="rounded-full py-2 px-4 bg-gray-200 w-auto inline-block text-xs mt-1">
            <strong>{m[0]}</strong> : {m[1]}
          </div>
        )}
      </li>
    ) : (
      <li key={m[1]} className="update py-4">
        {m[1]}
      </li>
    )
  );
};

const Online = props =>
  props.data.map(m => (
    <li className="text-sm" id={m[0]}>
      {m[1]}
    </li>
  ));

export default () => {
  const [id, setId] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [room, setRoom] = useState("");
  const [input, setInput] = useState("");

  const [socket] = useSocket("https://open-chat-naostsaecf.now.sh");
  socket.connect();

  const [messages, setMessages] = useImmer([]);
  const [online, setOnline] = useImmer([]);

  useEffect(() => {
    socket.on("message queue", (nick, message) => {
      setMessages(draft => {
        draft.push([nick, message]);
      });
    });

    socket.on("update", message =>
      setMessages(draft => {
        draft.push(["", message]);
      })
    );

    socket.on("people-list", people => {
      let newState = [];
      for (let person in people) {
        newState.push([people[person].id, people[person].nick]);
      }
      setOnline(draft => {
        draft.push(...newState);
      });
    });

    socket.on("add-person", (nick, id) => {
      setOnline(draft => {
        draft.push([id, nick]);
      });
    });

    socket.on("remove-person", id => {
      setOnline(draft => draft.filter(m => m[0] !== id));
    });

    socket.on("chat message", (nick, message) => {
      setMessages(draft => {
        draft.push([nick, message]);
      });
    });
    // eslint-disable-next-line
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    if (!nameInput) {
      return alert("Name can't be empty");
    }
    setId(nameInput);
    socket.emit("join", nameInput, room);
  };

  const handleSend = e => {
    e.preventDefault();
    if (input !== "") {
      socket.emit("chat message", input, room);
      setInput("");
      e.target.reset();
    }
  };

  const scrollToBottom = () => {
    animateScroll.scrollToBottom({
      containerId: "messages"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return id ? (
    <div>
      <section className="flex-row p-2">
        <ul id="online" className="overflow-y-auto p-2 bg-gray-300 rounded ">
          {" "}
          &#x1f310; : <Online data={online} />{" "}
        </ul>
        <ul id="messages" className="overflow-y-auto px-2 ">
          <Messages data={messages} id={id} />
        </ul>

        <div id="sendform" className="px-2 py-2">
          <form onSubmit={e => handleSend(e)} style={{ display: "flex" }}>
            <input
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-100"
              id="m"
              onChange={e => setInput(e.target.value.trim())}
            ></input>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full ml-2"
              type="submit"
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  ) : (
    <div className="py-40 mx-auto w-4/5">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={event => handleSubmit(event)}
      >
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
          id="name"
          onChange={event => setNameInput(event.target.value.trim())}
          required
          placeholder="What is your name .."
        ></input>
        <br />
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-8"
          id="room"
          onChange={event => setRoom(event.target.value.trim())}
          required
          placeholder="What is your room .."
        ></input>
        <br />
        <div className="flex justify-center ">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
