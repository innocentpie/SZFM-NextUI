//Work in progress
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/authentication/AuthContext';
import * as icons from '@/app/assets/SvgIcons';
import pb from '@/app/authentication/PocketBaseClient';
import { categories } from '../categories';
import headerStyles from '@app/header/Header.module.css';
import Header from '@/app/header/Header';
import { Card, CardBody } from '@nextui-org/card';
import './quizidpage.css';
import { Button } from '@nextui-org/button';
import { CircularProgress } from '@nextui-org/react';


export const dynamic = 'auto', dynamicParams = true, fetchCache = 'auto', runtime = 'nodejs', preferredRegion = 'auto'

const getQuiz = async (id : string) => {
  let data = await pb.collection('quizzes').getOne(id, {
    expand: 'creator',
  });
  return data as any;
};

let runningTimeout : NodeJS.Timeout | null = null;
let shouldStartTimeout : boolean = true;
function startTimer(startTimeMS : number,
  startDelayMs : number, 
  onTimerTick : (currentTime: number) => void,
  onTimerOver : () => void) {
    
  setTimeout(() => {
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
    }, 10)
  }, startDelayMs)
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
      let quiz = await getQuiz(id);
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

  const submitAnswer = (answerIndex : number | null) => {
    if(answerIndex != null) {
      if(correct_answers[questionIndex] == answers[questionIndex][answerIndex])
        correctAnswerCount += 1;
    }

    if(questions.length > questionIndex + 1) {
      shouldStartTimeout = true;
      if(runningTimeout != null){
        clearInterval(runningTimeout);
        runningTimeout = null;
      }
      setQuestionIdex(questionIndex + 1);
    }
    else{
      setQuizFinished(true);
    }
  }


  if(runningTimeout == null && shouldStartTimeout){
    shouldStartTimeout = false;

    let iTimerD = new TimerData();
    iTimerD.timeMS = timeLimitMS;
    iTimerD.timerProgressPct = 100;
    setTimerData(iTimerD);

    startTimer(timeLimitMS, 1000,
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
            <CardBody>
              <div className='card-body'>
                <p className='text-xl font-bold text-center'>Helyes válaszok: {correctAnswerCount}</p>
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
