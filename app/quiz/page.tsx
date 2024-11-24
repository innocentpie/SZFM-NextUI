'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../authentication/AuthContext';
import './quizpage.css';
import Header from "../header/Header";
import pb from '../authentication/PocketBaseClient';
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@nextui-org/react";
import { useSearchParams } from 'next/navigation';
import { categories } from './categories';

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

  const getBackgroundColor = (difficulty: string) => {
    switch (difficulty) {
      case "Könnyű":
        return '#00ff32'; // Zöld - könnyű
      case "Közepes":
        return '#FFC300'; // Sárga - közepes
      case "Nehéz":
        return '#FF1500'; // Piros - nehéz
      default:
        return '#8a8884'; // Alapértelmezett szürke
    }
  }

  // Suspense által bebugyolált keresési paraméterek
  return (
    <>
      <Header quizMainHeaderMode={true} />
      <div className='main-container'>
        <Suspense fallback={<div><h1><p>Betöltés...</p></h1></div>}>
          <QuizContent user={user} loadQuizzes={loadQuizzes} quizzes={quizzes} quizLoading={quizLoading} getBackgroundColor={getBackgroundColor} />
        </Suspense>
      </div>
    </>
  );
}

interface QuizContentProps {
  user: any;
  loadQuizzes: (searchQuery: string) => Promise<void>;
  quizzes: any[];
  quizLoading: boolean;
  getBackgroundColor: (difficulty: string) => string;
}

function QuizContent({ user, loadQuizzes, quizzes, quizLoading, getBackgroundColor }: QuizContentProps) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    if (user) {
      loadQuizzes(searchQuery);
    }
  }, [user, searchQuery]);

  // Ha az oldal vagy a kvízek betöltődnek
  if (quizLoading) return (<div><h1><p>Betöltés...</p></h1></div>);

  // Ha nincs bejelentkezve a felhasználó
  if (!user) return null;

  return (
    <div className='secondary-container'>
      {quizzes.map((quiz) => (
        <Card className='m-2 quiz-card' shadow="sm" key={quiz.id}>
          <CardHeader
            className='difficulty-chip-div'
            style={{
              background: getBackgroundColor(quiz.difficulty),
            }}>
            <div>
              {categories.map((cat) =>
                cat.label === quiz.category ? (
                  <div key={cat.label} title={cat.label}>
                    {cat.icon}
                  </div>
                ) : null
              )}
            </div>
            <div>
              <Chip>{quiz.difficulty}</Chip>
            </div>
          </CardHeader>
          <CardBody className="overflow-visible p-0">
            <div className='m-2 quiz-description'>
              <p className='text-small font-bold'>Készítő: {quiz.expand ? quiz.expand.creator.username : 'default'}</p>
              <div className='flex flex-row justify-between'>
                <h3 className='text-small font-bold'>Kérdések száma: {quiz.number_of_questions}</h3>
                <p className='text-small font-bold' style={{ marginRight: '0.5rem' }}>Kvíz kód: {quiz.quiz_code}</p>
              </div>
              <Divider className="my-4" style={{ background: getBackgroundColor(quiz.difficulty), height: '0.2rem' }} />
              <p className="text-small mt-1">{quiz.quiz_description}</p>
            </div>
          </CardBody>
          <CardFooter className='quiz-card-footer'>
            <div>
              <Button className='mr-1' isDisabled color='primary' as="a">
                <span>Kitöltés (wip)</span>
              </Button>
            </div>
            <div>
              <Button className='ml-1' isDisabled color='secondary'>
                <span>Ranglista (wip)</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
