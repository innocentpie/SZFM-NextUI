'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../authentication/AuthContext';
import { MdiFlask } from '../assets/SvgIcons';
import './homepage.css';
import Header from "../header/Header";
import chroma from 'chroma-js';

import {Button, Card, CardBody, CardFooter, CardHeader, Chip, Image} from "@nextui-org/react";
import {Divider} from "@nextui-org/divider";

const API_URL = 'http://127.0.0.1:8090/api/collections/quizzes/records';

async function getQuizzes(searchQuery = '') {
  const filter = searchQuery ? `quiz_code~"${searchQuery}" || category~"${searchQuery}"` : '';
  const res = await fetch(`${API_URL}?filter=${encodeURIComponent(filter)}&page=1&perPage=6`, { cache: 'no-cache' });
  const data = await res.json();
  return data?.items || [];
}

export default function QuizPage() {
  const { user, loading } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      loadQuizzes();
    }
  }, [user]);

  const loadQuizzes = async (searchQuery: string = '') => {
    try {
      const quizzesData = await getQuizzes(searchQuery);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Quizzes fetch hiba:', error);
    } finally {
      setQuizLoading(false);
    }
  };

  const getBackgroundColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return '#00ff32'; // Zöld - könnyű
      case 2:
        return '#FFC300'; // Sárga - közepes
      case 3:
        return '#FF1500'; // Piros - nehéz
      default:
        return '#8a8884'; // Alapértelmezett szürke
    }
  }

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return 'Könnyű'; // Zöld - könnyű
      case 2:
        return 'Közepes'; // Sárga - közepes
      case 3:
        return 'Nehéz'; // Piros - nehéz
      default:
        return '???'; // Alapértelmezett szürke
    }
  }

  const getDarkerShade = (color: string) => {
    try {
      return chroma(color).saturate(1).darken(1).hex();
    } catch (error) {
      console.error(`Hibás színérték: ${color}`, error);
      return '#000000';
    }
  };

  //ha tölt az oldal vagy a quizek akkor ezt írja ki
  if (loading || quizLoading) {
    return (<><div><h1><p>Betöltés...</p></h1></div></>);
  }

  //ha nincs bejelentkezve és valahogy mégis eléri az oldalt akkor egyszerűen visszatér a program
  //technikailag nem lehetséges mert azonnal visszairányítja a login oldalra
  if (!user) {
    return;
  }

  return (
    <>
      <Header />
      <div className='main-container'>
        <div className='secondary-container'>
          {quizzes.map((quiz) => (
            // <div key={quiz.id} className='rectangle' style={{ background: quiz.card_color }}>
            //   <h4 className='quiz-description'>{quiz.quiz_description}</h4>
            //   <span className='quiz-creator'>Készítő: {quiz.creator ? quiz.creator : 'default'}</span>
            //   <div className='flex-row'>
            //     <div className='line' />
            //     <span className='span'>{quiz.number_of_questions}</span>
            //     <span className='questions'>Kérdések:</span>
            //     <MdiFlask className='icon' />
            //     <span className='kat'>Kat.:</span>
            //     <span className='difficulty'>Nehézség</span>
            //     <div
            //       className='rectangle-1'
            //       style={{
            //         background: getBackgroundColor(quiz.difficulty),
            //       }} />
            //   </div>
            //   <div className='line-4' />
            //   <div className='line-5' />
            //   <div className='rectangle-2' style={{ background: getDarkerShade(quiz.card_color) }}>
            //     <button className='button'>
            //       <span className='kitoltas'>Kitöltés</span>
            //     </button>
            //     <button className='rectangle-3'>
            //       <span className='ranglista'>Ranglista</span>
            //     </button>
            //   </div>
            // </div>

            <Card className='m-2' shadow="sm" key={quiz.id}>
              <CardHeader
              className='difficulty-chip-div'
              style={{
                         background: getBackgroundColor(quiz.difficulty),
              }}>
                <div>
                  <MdiFlask className='icon' />
                </div>
                <div>
                  <Chip>{getDifficultyText(quiz.difficulty)}</Chip>
                </div>
              </CardHeader>
              <CardBody className="overflow-visible p-0">
                <div className='m-2 quiz-description'>
                  <p className='text-small font-bold'>Készítő: {quiz.creator ? quiz.creator : 'admin'}</p>
                  <p className='text-small font-bold'>Kérdések: {quiz.number_of_questions}</p>
                  <p className="text-small mt-1">{quiz.quiz_description}</p>
                </div>
              </CardBody>
              <CardFooter>
                <Button className='mr-1' color='primary'>
                   <span>Kitöltés</span>
                 </Button>
                 <Button className='ml-1' color='secondary'>
                  <span>Ranglista</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
