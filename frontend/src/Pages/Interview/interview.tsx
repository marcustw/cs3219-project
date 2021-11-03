import React from "react";
import Button from "@material-ui/core/Button";
import Editor from "../../Components/Editor/editor";
import Chat from "../../Components/Chat/chat";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import { CardContent } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import { useEffect, useState, useParams } from "react";
import { useCookies } from "react-cookie";
import { useHistory } from "react-router-dom";
import Question from "../../Components/Question/question";
import Loading from "../Loading/loading"
import * as qns from "../../questions/question-easy";
import "./interview.css";
import EndInterviewModal from "../../Components/EndInterviewModal/endInterviewModal";
import { MATCH_API_URL, QNS_API_URL, API_HEADERS } from "../../api";


const Interview = (props:any) => {

  const [cookies] = useCookies(["userInfo"]);
  const [show, setShow] = useState(false);

  const [ interviewId, title ] = useParams<String>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [question, setQuestion] = useState<any>(null);
  const [peer, setPeer] = useState("");


  useEffect(() => {
    const userInfo = cookies.userInfo;
    console.log(`userInfo.username = ${userInfo.user.username}`);
    
    var arr = interviewId.split(userInfo.user.username);
    if (arr[0] === "") {
      setPeer(arr[1].substring(1, arr[1].length));
    } else {
      setPeer(arr[0].substring(0, arr[0].length - 1));
    }
    
  }, [setPeer, interviewId, cookies]);

  userEffect(() => {
    if (!isLoaded) {
      getQuestionInfo();
    };
  }, [isLoaded])

  const onClickEndSession = () => {
    console.log("End session");
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  }

  const getQuestionInfo = async() => {
    if (!isLoaded) {
      //TODO: Fetch Match details => Get Question Title and Difficulty
      // const qnTitle = await fetch(MATCH_API_URL + `/matches/match/${userInfo.user.username}`, {
      //   method: "GET",
      //   headers: API_HEADERS
      // }).then(async (res) => {
      //   var result = await res.json();
      //   console.log(res.data);
      //   return result.data;
      // }).catch((err) => {
      //   console.log(err);
      // })

      //TODO: Fetch Question details
      const qn = await fetch(QNS_API_URL + `/questions/${title}`, {
        method: "GET",
        headers: API_HEADERS
      }).then(async (res) => {
        var result = await res.json();
        console.log(res.data);
        return result.data;
      }).catch((err) => {
        console.log(err);
        return null; // TODO: require error handling
      });

      if (qn !== null && qn !== undefined) {
        setQuestion(qn);
        setIsLoaded(true);
      }
    }
  }

  return (
    !isLoaded ? <Loading isRed={false} /> :
    <>
      <Container className="main-container">
        <div>
          <Typography
            variant="h3"
            component="h3"
            gutterBottom
            style={{ textTransform: "capitalize" }}
          >
            Interview
          </Typography>
          <Typography
            gutterBottom
            variant="body1"
            color="textSecondary"
            component="p"
            style={{ textTransform: "capitalize" }}
          >
            Difficulty: {question.difficulty}
          </Typography>
          <Typography
            gutterBottom
            variant="body1"
            color="textSecondary"
            component="p"
            style={{ textTransform: "capitalize" }}
          >
            Peer: {peer}
          </Typography>
        </div>
        <div>
          <Button
            style={{ width: 140 }}
            variant="contained"
            color="secondary"
            onClick={onClickEndSession}
          >
            End Session
          </Button>
        </div>
        <EndInterviewModal show={show} onHide={handleClose} />
        <div className="interview-panel" style={{ paddingTop: "20px" }}>
          <div className="left-panel">
            <Card style={{ display: "flex", flex: 1, marginBottom: 16 }}>
              <CardContent
                style={{ display: "flex", flex: 1, flexDirection: "column" }}
              >
                <div className="interview-question-container">
                  <Question
                    title={question.title}
                    description={question.description}
                    image={question.image} //TODO: Convert string to image (RISHI HELP)
                    testInput={question.testcases.input}
                    testOutput={question.testcases.output}
                  />
                </div>
              </CardContent>
            </Card>
            <Card style={{ display: "flex", flex: 3, height: "5in" }}>
              <CardContent
                style={{ display: "flex", flex: 1, flexDirection: "column" }}
              >
                <h3>Chat</h3>
                <Chat
                  username={cookies.userInfo.user.username}
                />
              </CardContent>
            </Card>
          </div>
          <div className="right-panel">
            <Card style={{ display: "flex", flex: 7, height: "10.51in" }}>
              <CardContent style={{ width: "9in" }}>
                <Editor />
              </CardContent>
            </Card>
          </div>
          <div style={{ paddingBottom: "20px" }} />
        </div>
      </Container>
    </>
  );
};

export default Interview;
