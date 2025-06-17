import { useEffect, useState } from "react";
import "./style.css";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

const initialFacts = [
  {
    id: 1,
    text: "React is being developed by Meta (formerly facebook)",
    source: "https://opensource.fb.com/",
    category: "technology",
    votesInteresting: 24,
    votesMindblowing: 9,
    votesFalse: 4,
    createdIn: 2021,
  },
  {
    id: 2,
    text: "Millennial dads spend 3 times as much time with their kids than their fathers spent with them. In 1982, 43% of fathers had never changed a diaper. Today, that number is down to 3%",
    source:
      "https://www.mother.ly/parenting/millennial-dads-spend-more-time-with-their-kids",
    category: "society",
    votesInteresting: 11,
    votesMindblowing: 2,
    votesFalse: 0,
    createdIn: 2019,
  },
  {
    id: 3,
    text: "Lisbon is the capital of Portugal",
    source: "https://en.wikipedia.org/wiki/Lisbon",
    category: "society",
    votesInteresting: 8,
    votesMindblowing: 3,
    votesFalse: 1,
    createdIn: 2015,
  },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  async function fetchFacts() {
    try {
      //const res = await fetch("http://localhost:8000/getData");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/getData`);
      console.log("Fetching from:", `${process.env.REACT_APP_API_URL}/getData`);
      const data = await res.json();
      setFacts(data);
    } catch (error) {
      console.error("Error fetching facts:", error);
    }
  }

  // 2. Fetch data when app loads
  useEffect(() => {
    fetchFacts();
  }, []);

  const filteredFacts =
    selectedCategory === "all"
      ? facts
      : facts.filter((fact) => fact.category === selectedCategory);

  return (
    <>
      {/* {header} */}
      <Header setShowForm={setShowForm} />
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setSelectedCategory={setSelectedCategory} />
        <FactList facts={filteredFacts} fetchFacts={fetchFacts} />
      </main>
    </>
  );
}

export default App;

function Header({ setShowForm }) {
  const appTitle = "Today I Learned!!";
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="logo" height="56" />
        <h1>{appTitle}</h1>
      </div>
      <button
        id="factButton"
        className="btn bigBtn"
        onClick={() => setShowForm((show) => !show)}
      >
        share a fact
      </button>
    </header>
  );
}
function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("https://example.com");
  const [category, setCategory] = useState();
  const textLength = text.length;

  async function handelSubmit(e) {
    //1 prevent browser reload
    e.preventDefault();
    console.log(text, source, category);

    //if data is valid
    if (text && source && category && textLength <= 200) {
      console.log("there is data");
    } else console.log("enter valid data");

    //3 create fact obj
    const newFact = {
      id: Math.random(Math.random() * 100000),
      text,
      source,
      category,
      votesInteresting: 0,
      votesMindblowing: 0,
      votesFalse: 0,
      createdIn: new Date().getFullYear(),
    };

    try {
      // //4 add new fact to ui
      // setFacts((facts) => [newFact, ...facts]);
      // //5 reset input fiels
      // setText("");
      // setSource("");
      // setCategory("");
      // //6 close the form
      // setShowForm(false);
      const res = await fetch("http://localhost:8000/createFact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFact),
      });

      if (!res.ok) throw new Error("Error posting fact");

      const data = await res.json();
      setFacts((prev) => [data, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error("Post error:", error);
    }
  }
  return (
    <form action="" className="factForm" onSubmit={handelSubmit}>
      <input
        className="factFormChild"
        type="text"
        placeholder="enter valid fact"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <span>{200 - textLength}</span>
      <input
        className="factFormChild"
        type="text"
        placeholder="enter source of fact"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <select
        className="factFormChild"
        name="categoryDropDown"
        id="categoryDropDown"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">choose category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name}
          </option>
        ))}
      </select>
      <button className="btn bigBtn">post</button>
    </form>
  );
}

function CategoryFilter({ setSelectedCategory }) {
  return (
    <aside>
      <button
        className="btn bigBtn allCategoryBtn"
        onClick={() => setSelectedCategory("all")}
      >
        all
      </button>
      {CATEGORIES.map((cat) => (
        <div key={cat.name}>
          <ul>
            <li>
              <button
                style={{ backgroundColor: cat.color }}
                className="btn categoryBtn"
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </button>
            </li>
          </ul>
        </div>
      ))}
    </aside>
  );
}

function FactList({ facts, fetchFacts }) {
  return (
    <section className="facts">
      <ul>
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} fetchFacts={fetchFacts} />
        ))}
      </ul>
      <p>there are {facts.length} in database</p>
    </section>
  );
}

function Fact({ fact, fetchFacts }) {
  async function handelVote(type) {
    try {
      const response = await fetch(`http://localhost:8000/vote/${fact.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) throw new Error("Failed to update vote");

      // 🔁 Re-fetch latest data
      fetchFacts();

      // Optional: Update local state or trigger re-fetch
      console.log(`Voted on ${type} for fact ID ${fact.id}`);
    } catch (error) {
      console.error("Vote error:", error);
    }
  }
  try {
    return (
      <li className="factlist">
        <div>
          <p>{fact.text}</p>
          <a href={fact.source}>(source)</a>
        </div>
        <span
          style={{
            backgroundColor: CATEGORIES.find(
              (cat) => cat.name === fact.category
            ).color,
          }}
        >
          {fact.category}
        </span>
        <div className="voteBtn">
          <button onClick={() => handelVote("votesInteresting")}>
            👍{fact.votesInteresting}
          </button>
          <button onClick={() => handelVote("votesMindblowing")}>
            🤯{fact.votesMindblowing}
          </button>
          <button onClick={() => handelVote("votesFalse")}>
            ⛔{fact.votesFalse}
          </button>
        </div>
      </li>
    );
  } catch (error) {
    //alert("enter valid data", error);
    console.error(error);
  }
}
