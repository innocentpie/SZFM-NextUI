//Work in progress
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/authentication/AuthContext';
import * as icons from '@/app/assets/SvgIcons';
import pb from '@/app/authentication/PocketBaseClient';
import { categories } from '../categories';
import headerStyles from '@app/header/Header.module.css';
import Header from '@/app/header/Header';


export const dynamic = 'auto', dynamicParams = true, fetchCache = 'auto', runtime = 'nodejs', preferredRegion = 'auto'

const getQuiz = async (id : string) => {
  let data = await pb.collection('quizzes').getOne(id, {
    expand: 'creator',
  });
  return data as any;
};

export default function QuizPage({ params }: { params: {id: string }} ){
  const { user, loading } = useAuth();
  const [quizLoading, setQuizLoading] = useState<boolean>(true);
  const [quiz, setQuiz] = useState<any>(null);
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

  if (quiz == null || quiz == undefined) return (<><div><h1><p>A kvíz nem elérhető vagy nem létezik... ({id})</p></h1></div></>);

  return(
    <>
      <Header quizMainHeaderMode={false} />
    </>
  )
}
