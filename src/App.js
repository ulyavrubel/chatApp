import React, { useState, useEffect } from "react";
import "./App.css";
import useSocket from "use-socket.io-client";
import { useImmer } from "use-immer";

const Messages = props =>
  props.data.map(m =>
    m[0] !== "" ? (
      <li key={m[0]}>
        <strong>{m[0]}</strong> : <div className="innermsg">{m[1]}</div>
      </li>
    ) : (
      <li key={m[1]} className="update">
        {m[1]}
      </li>
    )
  );

const Online = props => props.data.map(m => <li id={m[0]}>{m[1]}</li>);

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
    }
  };

  return id ? (
    <section style={{ disply: "flex", flexDirection: "row" }}>
      <ul id="messages">
        <Messages data={messages} />
      </ul>
      <ul id="online">
        {" "}
        &#x1f310; : <Online data={online} />{" "}
      </ul>
      <div id="sendform">
        <form onSubmit={e => handleSend(e)} style={{ display: "flex" }}>
          <input id="m" onChange={e => setInput(e.target.value.trim())}></input>
          <button style={{ width: "75px" }} type="submit">
            Send
          </button>
        </form>
      </div>
    </section>
  ) : (
    <div class="container mx-auto">
      <div
        className="flex flex-row justify-center box-border p-4 border border-gray-200 w-1/3  inline-block shadow-lg"
        style={{ textAlign: "center", margin: "30vh auto" }}
      >
        <div className="box-content ">
          <form
            onSubmit={event => handleSubmit(event)}
            className="w-full max-w-sm"
          >
            <div className="md:flex md:items-center mb-6">
              <div className="md:w-1/3">
                <label
                  className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                  for="name"
                >
                  Name
                </label>
              </div>
              <div className="md:w-2/3">
                <input
                  id="name"
                  onChange={event => setNameInput(event.target.value.trim())}
                  required
                  placeholder="What is your name .."
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                  type="text"
                />
              </div>
            </div>
            <div className="md:flex md:items-center mb-6">
              <div className="md:w-1/3">
                <label
                  className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
                  for="room"
                >
                  Room
                </label>
              </div>
              <div className="md:w-2/3">
                <input
                  id="room"
                  onChange={event => setRoom(event.target.value.trim())}
                  required
                  placeholder="What is your room .."
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>
            </div>

            <div className="md:flex md:items-center">
              <div className="md:w-1/3"></div>
              <div className="md:w-2/3">
                <button
                  className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* <form onSubmit={event => handleSubmit(event)}>
        <input
          id="name"
          onChange={event => setNameInput(event.target.value.trim())}
          required
          placeholder="What is your name .."
        ></input>
        <br />
        <input
          id="room"
          onChange={event => setRoom(event.target.value.trim())}
          required
          placeholder="What is your room .."
        ></input>
        <br />
        <button type="submit">Submit</button>
      </form> */}
    </div>
  );
};
