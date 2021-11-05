import Header from "../../Components/Header/header";
import "./home.css";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";
import { Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import { Cursor, PersonSquare } from "react-bootstrap-icons";
import LoadingModal from "../../Components/LoadingModal/loadingmodal";
import { USER_API_URL, MATCH_API_URL, MATCH_URL, QNS_API_URL, API_HEADERS } from "../../api";
import SelectInput from "@material-ui/core/Select/SelectInput";
import PastMatch from "../../Components/PastMatch/pastmatch";
import io, { Socket } from "socket.io-client";
import { userInfo } from "os";
import { stringify } from "querystring";
import { FriendList } from "../../Components/FriendList/friendlist";
import { createUniqueName } from "typescript";

const API_URL = USER_API_URL;


const Home = (props: any) => {
  const [socket, setSocket] = useState<Socket>();
  const [connected, setConnected] = useState(false);
  // const [spin, setSpin] = useState(false);
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState("");
  var [friendData, setfriendData] = useState([]);
  const [cookies] = useCookies(["userInfo"]);
  const [token, setToken] = useState("");
  const [xp, setXp] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  const history = useHistory();

  // friendData = [
  //     {
  //       friend_username: "Test"
  //     },
  //     {
  //       friend_username: "Le Pioche"
  //     },
  //     {
  //       friend_username: "El Matador"
  //     },
  //     {
  //       friend_username: "El Nino"
  //     }
  // ]

  useEffect(() => {
    const userInfo = cookies.userInfo;
    // No record of session login
    if (!userInfo) {
      history.push("/");
    } else {
      // Set name
      const data = userInfo.user.username;
      setUsername(data);
      // console.log(userInfo.token)
      // getFriends(userInfo.token);
      setToken(userInfo.token);
    }
  }, [cookies.userInfo, history]);

  // connect to match socket
  useEffect(() => {
    if (connected === false && username) {
      const sock = io(MATCH_URL);
      sock.on(`match-found-${username}`, (result) => {
        const matchedUsername = result.match;
        const questionTitle = result.questionTitle;
        console.log(`YOU ARE MATCHED WITH ... ${matchedUsername} !!!`);
        var sessionId = "";
        if (matchedUsername < username) {
          sessionId = matchedUsername + "-" + username;
        } else {
          sessionId = username + "-" + matchedUsername;
        }
        console.log("SESSION ID IS: " + sessionId);
        history.push(`/interview/${sessionId}/${questionTitle}`);
        sock.disconnect();
      });
      setSocket(sock);
      setConnected(true);
    }
  }, [socket, connected, username, history]);

  // get user's match details
  useEffect(() => {
    getUserMatchDetails();
  });

  const getUserMatchDetails = async () => {
    const uname = cookies.userInfo.user.username;
    await fetch(MATCH_API_URL + `/matches/match/${uname}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json; charset=utf-8",
        Authorization: "Bearer " + token,
      },
    })
      .then(async (res) => {
        var result = await res.json();
        var data = result.data;
        setXp(data.xp);
        setIsOnline(data.isOnline);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleClose = async () => {
    setShow(false);
    await fetch(MATCH_API_URL + "/matches/match", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json; charset=utf-8",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        username: username,
        isOnline: isOnline,
        wantsMatch: false,
        xp: xp,
      }),
    })
      .then(async (res) => {
        var result = await res.json();
        console.log(result.message);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getFriends = async (token) => {
    await fetch(API_URL + "/user-friend/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json; charset=utf-8",
        Authorization: "Bearer " + token,
      },
    })
      .then(async (res) => {
        var result = await res.json();
        if (res.status === 200) {
          // console.log(result)
          setfriendData(result.data);
        } else {
          setfriendData(result.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const difficultyData = [
    ["Easy", "success"],
    ["Medium", "primary"],
    ["Hard", "danger"],
  ];

  const navInterviewPage = async (qnDifficulty) => {

    setShow(true);

    // Get a random question and its information
    const qn = await fetch(QNS_API_URL + `/questions/difficulty/${qnDifficulty.toLowerCase()}`, {
      method: "GET",
      headers: API_HEADERS
    }).then(async (res) => {
      var result = await res.json();
      return result;
    }).catch((err) => {
      console.log(err);
      return null; // TODO: require error handling
    });

    console.log(`Title = ${qn.data[0].title}\n`);
    const qnTitle = qn;

    if (qnTitle === null || qnTitle === undefined) {
      console.log("Something went wrong.");
      setShow(false);
    } else {
      // delete user match first
      await fetch(MATCH_API_URL + "/matches", {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json; charset=utf-8",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          username: username,
        }),
      })
        .then(async (res) => {
          var result = await res.json();
          console.log(result.message);
        })
        .catch((err) => {
          console.log(err);
        });

      // request for a match
      await fetch(MATCH_API_URL + "/matches", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json; charset=utf-8",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          username: username,
          questionTitle: qnTitle, // add qn info
          questionDifficulty: qnDifficulty
        }),
      })
        .then(async (res) => {
          var result = await res.json();
          console.log(result.message);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    
  };

  return (
    <div className="">
      <Header isSignedIn={true}></Header>
      <div className="home">
        <section className="pb-1 mb-2">
          <h1 className="text-primary">Welcome, {username} </h1>
          <h4>
            {" "}
            <em> What's on your mind today? </em>
          </h4>
        </section>
        {/* landing content */}
        <LoadingModal show={show} onHide={handleClose} />
        <Row>
          <Col sm={7}>
            <Card className="mb-3 home-card">
              <Card.Body>
                <Card.Title className="fs-4 mb-3"> User Profile</Card.Title>
                <Card.Subtitle className="mt-2 mb-3 text-muted">
                  {username}
                </Card.Subtitle>
                <Card.Text>
                  <strong> Rank: </strong>
                </Card.Text>
                <Card.Text>
                  <strong> XP: </strong>
                </Card.Text>
                <Card.Subtitle className="mt-2 mb-3 text-muted">
                  {xp}
                </Card.Subtitle>
              </Card.Body>
            </Card>
            <PastMatch />
          </Col>
          <Col sm={5}>
            <Card className="mb-3 home-card">
              <Card.Body>
                <Card.Title className="fs-4 mb-3">
                  {" "}
                  Find a peer and get cracking!{" "}
                </Card.Title>
                <Card.Subtitle
                  className="mt-2 mb-3 text-muted fw-light"
                  style={{ fontSize: 14 }}
                >
                  Simply pick a question based on the difficulty you're pitting
                  yourself up against and we will match you with someone who's
                  just as determined and skilled as you!
                </Card.Subtitle>
                <div className="d-grid gap-2 mb-3">
                  {difficultyData.map((item, idx) => {
                    return (
                      <Button className="my-2" variant={item[1]} key={idx} onClick={() => navInterviewPage(item[0])}>
                        <Cursor className="mb-1 me-1" />
                        {item[0]}
                        <br />
                      </Button>
                    );
                  })}
                </div>
                <Card.Text className="lh-sm">
                  Upon the start of a successful pairing, users can work on a
                  problem together with a messaging panel and a coshared text
                  editor. The session can be terminated any time and your XP
                  will be weighted accordingly based on your peer's feedback of
                  you.
                </Card.Text>
              </Card.Body>
            </Card>
            <FriendList friendList={friendData} />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;
