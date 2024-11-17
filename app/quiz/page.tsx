'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../authentication/AuthContext';
import { MdiFlask } from '../assets/SvgIcons';
import './homepage.css';
import Header from "../header/Header";

import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Image, ScrollShadow } from "@nextui-org/react";
import { Divider } from "@nextui-org/divider";

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
        return '#D3D3D3'; // Alapértelmezett szürke
    }
  }

  //ha tölt az oldal vagy a quizek akkor ezt írja ki
  if (loading || quizLoading) return (<><div><h1><p>Betöltés...</p></h1></div></>);

  //ha nincs bejelentkezve és valahogy mégis eléri az oldalt akkor egyszerűen visszatér a program
  //technikailag nem lehetséges mert azonnal visszairányítja a login oldalra
  if (!user) return;

  return (
    <>
      <Header />
      <div className='main-container'>
        <div className='secondary-container'>
          {quizzes.map((quiz) => (
            <Card className='m-2 quiz-card' shadow="sm" key={quiz.id}>
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
              <CardFooter className='quiz-card-footer'>
                <div>
                  <Button className='mr-1' color='primary'>
                    <span>Kitöltés</span>
                  </Button>
                </div>
                <div>
                  <Button className='ml-1' color='secondary'>
                    <span>Ranglista</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
