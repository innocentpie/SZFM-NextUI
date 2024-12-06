//Work in progress
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/authentication/AuthContext';
import * as icons from '@/app/assets/SvgIcons';
import pb from '@/app/authentication/PocketBaseClient';
import { categories } from '../categories';
import headerStyles from '@app/header/Header.module.css';
import Header from '@/app/header/Header';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import './quizidpage.css';
import { Button } from '@nextui-org/button';
import { CircularProgress } from '@nextui-org/react';


export const dynamic = 'auto', dynamicParams = true, fetchCache = 'auto', runtime = 'nodejs', preferredRegion = 'auto'

const getQuiz = async (filter : string) => {
  try{

    let data = await pb.collection('quizzes').getFirstListItem(
      filter,
      { expand: 'creator', }
    );
    return data as any;
  }
  catch(error: any){
    return null;
  }
};

let runningTimeout : NodeJS.Timeout | null = null;
let shouldStartTimeout : boolean = true;
function startTimer(startTimeMS : number, 
  onTimerTick : (currentTime: number) => void,
  onTimerOver : () => void) {
    let prevTimeMS = Date.now();
    let timerCurrentMS = startTimeMS;

    runningTimeout = setInterval(function() {
      let nowMS = Date.now();
      let diff = nowMS - prevTimeMS;
      prevTimeMS = nowMS;

      timerCurrentMS -= diff;
      if(timerCurrentMS < 0) {
        timerCurrentMS = 0;
      }
      
      onTimerTick(timerCurrentMS);

      if(timerCurrentMS <= 0) {
        if(runningTimeout != null) {
          clearInterval(runningTimeout);
          runningTimeout = null;
        }
        
        onTimerOver();
      }
    }, 10);
}

class TimerData {
  public timerProgressPct : number = 100;
  public color: "success" | "warning" | "danger" = "success";
  public timeMS : number = 0;
}

const formatMSToLabel = (ms : number) => {
  let d = new Date(ms);
  let parts = [
    d.getMinutes(),
    d.getSeconds(),
    // d.getMilliseconds()
  ];
  // Zero-pad
  let formatted = parts.map(s => String(s).padStart(2,'0')).join(':');
  return formatted;
}

let correctAnswerCount = 0;
let totalScore = 0;

export default function QuizPage({ params }: { params: {id: string }} ){
  const { user, loading } = useAuth();
  const [quizLoading, setQuizLoading] = useState<boolean>(true);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [questionIndex, setQuestionIdex] = useState<number>(0);
  const [timerData, setTimerData] = useState<TimerData>();
  useEffect(() => {
    if (user) {
      loadPage();
    }
  }, [user]);
  
  const loadPage = async () => {
    try{
      let id = (params).id;

      let filter = `id~"${id}"`
      let quiz = await getQuiz(filter);
      console.log(quiz);
      if(quiz == null){
        filter = `quiz_code~"${id}"`
        quiz = await getQuiz(filter);
      }
      console.log(quiz);

      setQuiz(quiz);
    }
    catch (error) {
      console.error('Quiz fetch hiba:', error);
    }
    finally {
      setQuizLoading(false);
    }
  }
  const id = (params).id;

  //ha nincs bejelentkezve és valahogy mégis eléri az oldalt akkor egyszerűen visszatér a program
  //technikailag nem lehetséges mert azonnal visszairányítja a login oldalra
  if (!user) return;

  //ha tölt az oldal vagy a quizek akkor ezt írja ki
  if (loading || quizLoading) return (<><div><h1><p>Betöltés...</p></h1></div></>);

  if (quiz == null || quiz == undefined) return (<><div><h1><p>A kvíz ({id}) nem elérhető vagy nem létezik...</p></h1></div></>);

  const questions = JSON.parse(quiz.questions);
  const answers = JSON.parse(quiz.answers);
  const correct_answers = JSON.parse(quiz.correct_answers);
  const timeLimitMS = 10000;

  const submitAnswer = async (answerIndex : number | null) => {
    if(runningTimeout != null){
      clearInterval(runningTimeout);
      runningTimeout = null;
    }

    if(answerIndex != null) {
      if(correct_answers[questionIndex] == answers[questionIndex][answerIndex]) {
        correctAnswerCount += 1;
        let spentTimePct = 0;
        if(timerData != null)
          spentTimePct = (timerData.timeMS / timeLimitMS);
        
        spentTimePct = Math.pow(spentTimePct, 0.5);
        let score = Math.round(spentTimePct * 100);
        totalScore += score;
        console.log(score);
      }
    }

    if(questions.length > questionIndex + 1) {
      shouldStartTimeout = true;
      setQuestionIdex(questionIndex + 1);
    }
    else{
      endQuiz();
      await pb.collection('scores').create({
        "quiz_id": quiz?.id,
        "user_id": user.id,
        "score": totalScore,
        "correct_answers": correctAnswerCount,
      })
    }
  }

  const endQuiz = () => {
    setQuizFinished(true);

  }


  if(runningTimeout == null && shouldStartTimeout){
    shouldStartTimeout = false;

    let iTimerD = new TimerData();
    iTimerD.timeMS = timeLimitMS;
    iTimerD.timerProgressPct = 100;
    setTimerData(iTimerD);

    startTimer(timeLimitMS,
      (currentTime) => {
        let pct = (currentTime / timeLimitMS) * 100;
        let d : TimerData = new TimerData();
        d.timeMS = currentTime;
        d.timerProgressPct = pct;

        if(pct > 66)
          d.color = "success";
        else if(pct > 33)
          d.color = "warning";
        else
          d.color = "danger";

        setTimerData(d);
      },
      () => {
        submitAnswer(null);
        // alert("timer out");
      });
  }
      
  return(
    <>
    <Header quizMainHeaderMode={false}/>
    {quizFinished &&
    <div className='outer-content-div'>
      <div className='content-div'>
      <div className='center-col'>
          <Card className='main-card'>
            <CardHeader className='justify-center'>
              <p className='text-xl font-bold text-center'>Gratulálunk!</p>
            </CardHeader>
            <CardBody>
              <div className='card-body'>
                <div className='flex justify-center items-center flex-col'>
                  <p className='text-xl font-bold text-center'>Helyes válaszok: {correctAnswerCount}</p>
                  <p className='text-xl font-bold text-center'>Pontszám: {totalScore}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
    }

    {!quizFinished &&
    <div className='outer-content-div'>
      <div className='content-div'>
        <div className='side-col'>
        </div>
        <div className='center-col'>
          <Card className='main-card'>
            <CardBody>
              <div className='card-body'>
                <p className='text-xl font-bold text-center'>{questions[questionIndex]}</p>
                <div className='answers-div'>
                  {answers[questionIndex].map((ans : string, index : number) => (
                    <Button className='answer-button' key={index} onClick={() => submitAnswer(index)}>
                      <span className='text-xl text-center'>{ans}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className='side-col'>
          <Card className='clock-card'>
            <CardBody>
              <div className='clock-body'>
                <p className='text-xl text-center'>Kérdésre hátralévő idő</p>
                <div>
                  <CircularProgress
                    aria-label="Loading..."
                    classNames={{
                      svg: "w-24 h-24",
                      label: "text-xl"
                    }}
                    disableAnimation
                    value={timerData?.timerProgressPct ?? 100}
                    strokeWidth={4}
                    color={timerData?.color ?? "success"}
                    showValueLabel={false}
                    label={timerData?.timeMS != null ? formatMSToLabel(timerData.timeMS) : formatMSToLabel(timeLimitMS)}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
    }
    </>
  )
}
