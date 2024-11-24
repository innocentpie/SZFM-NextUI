'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../authentication/AuthContext';
import * as icons from '../assets/SvgIcons';
import './quizpage.css';
import Header from "../header/Header";
import pb from '../authentication/PocketBaseClient';
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@nextui-org/react";
import Link from 'next/link';
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

  //ha tölt az oldal vagy a quizek akkor ezt írja ki
  if (loading || quizLoading) return (<><div><h1><p>Betöltés...</p></h1></div></>);

  //ha nincs bejelentkezve és valahogy mégis eléri az oldalt akkor egyszerűen visszatér a program
  //technikailag nem lehetséges mert azonnal visszairányítja a login oldalra
  if (!user) return;

  // const categories = [
  //   { label: 'matematika', icon: <icons.MynauiMathSolidWhite /> },
  //   { label: 'tudomány', icon: <icons.MdiFlaskWhite /> },
  //   { label: 'művészet', icon: <icons.MdiArtWhite /> },
  //   { label: 'sport', icon: <icons.FluentSport16RegularWhite /> },
  //   { label: 'technológia', icon: <icons.GridiconsPhoneWhite /> },
  //   { label: 'utazás', icon: <icons.FaPlaneWhite /> },
  //   { label: 'videók', icon: <icons.RiMovieLineWhite /> },
  //   { label: 'film', icon: <icons.BxCameraMovieWhite /> },
  //   { label: 'zene', icon: <icons.MdiMusicWhite /> },
  //   { label: 'könyvek', icon: <icons.MaterialSymbolsBookOutlineWhite /> },
  //   { label: 'játékok', icon: <icons.IonGameControllerOutlineWhite /> },
  //   { label: 'egyéb', icon: <icons.BasilOther1OutlineWhite /> },
  // ];

  return (
    <>
      <Header quizMainHeaderMode={true}/>
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
                    <p className='text-small font-bold' style={{marginRight: '0.5rem'}}>Kvíz kód: {quiz.quiz_code}</p>
                  </div>
                  <Divider className="my-4" style={{ background: getBackgroundColor(quiz.difficulty), height: '0.2rem' }} />
                  <p className="text-small mt-1">{quiz.quiz_description}</p>
                </div>
              </CardBody>
              <CardFooter className='quiz-card-footer'>
                <div>
                  {/* <Link href={`/quiz/${quiz.id}`} passHref> */}
                    <Button className='mr-1' isDisabled color='primary' as="a">
                      <span>Kitöltés (wip)</span>
                    </Button>
                  {/* </Link> */}
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
      </div>
    </>
  );
}
