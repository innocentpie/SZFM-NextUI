'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../authentication/AuthContext';
import { MdiFlask } from '../assets/SvgIcons';
import './quizpage.css';
import Header from "../header/Header";
import pb from '../authentication/PocketBaseClient';
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@nextui-org/react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'auto', dynamicParams = true, fetchCache = 'auto', runtime = 'nodejs', preferredRegion = 'auto'

const getQuizzes = async (filter: string = '') => {
  const data = await pb.collection('quizzes').getList(1, 50, {
    filter: filter,
    expand: 'creator',
  });
  return data?.items as any[];
};

export default function QuizPage() {
  const { user, loading } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  useEffect(() => {
    if (user) {
      loadQuizzes(searchQuery);
    }
  }, [user, searchQuery]);

  const loadQuizzes = async (searchQuery: string = '') => {
    try {
      let filter = '';
      if (searchQuery) {
        const hasUppercase = /[A-Z]/.test(searchQuery);
        if (hasUppercase) {
          filter = `quiz_code="${searchQuery}"`;
        } else {
          filter = `category~"${searchQuery}"`;
        }
      }
      const quizzesData = await getQuizzes(filter);
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
                  <p className='text-small font-bold'>Készítő: {quiz.expand ? quiz.expand.creator.username : 'default'}</p>
                  <p className='text-small font-bold'>Kérdések: {quiz.number_of_questions}</p>
                  <Divider className="my-4" style={{ background: getBackgroundColor(quiz.difficulty), height: '0.2rem' }} />
                  <p className="text-small mt-1">{quiz.quiz_description}</p>
                </div>
              </CardBody>
              <CardFooter className='quiz-card-footer'>
                <div>
                  <Link href={`/quiz/${quiz.id}`} passHref>
                    <Button className='mr-1' color='primary' as="a">
                      <span>Kitöltés</span>
                    </Button>
                  </Link>
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
