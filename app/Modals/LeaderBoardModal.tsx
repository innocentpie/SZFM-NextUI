
'use client';

import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider } from "@nextui-org/react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@nextui-org/react";

interface Quiz {
  id: string;
  quiz_code: string;
  quiz_description: string;
  number_of_questions: number;
  category: string;
  difficulty: string;
  questions: string;
  answers: string;
  correct_answers: string;
  creator: string;
  created: string;
  updated: string;
}

interface LeaderBoardModalProps {
  isOpen: boolean;
  quiz_id: string|null;
  onClose: () => void;
}

const LeaderBoardModal: React.FC<LeaderBoardModalProps> = ({ isOpen, quiz_id, onClose }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  console.log(quiz_id)

  const Quize_c = ({ quizCode }: any) => {
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      
        <span>{quizCode}</span>
        
      </div>
    );
  }; 
  
    
    return (
      <>
        
        <Modal 
          backdrop="opaque" 
          isOpen={isOpen} 
          
          motionProps={{
            variants: {
              enter: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              },
              exit: {
                y: -20,
                opacity: 0,
                transition: {
                  duration: 0.2,
                  ease: "easeIn",
                },
              },
            }
          }}
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">Legjobb eredmények: </ModalHeader>
                {/* <Quize_c quizCode={quiz.quiz_code} /> */}
                <ModalBody>
                <Table removeWrapper aria-label="Example static collection table">
                  <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>ROLE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                  </TableHeader>
                  <TableBody>
                    <TableRow key="1">
                      <TableCell>Tony Reichert</TableCell>
                      <TableCell>CEO</TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                    <TableRow key="2">
                      <TableCell>Zoey Lang</TableCell>
                      <TableCell>Technical Lead</TableCell>
                      <TableCell>Paused</TableCell>
                    </TableRow>
                    <TableRow key="3">
                      <TableCell>Jane Fisher</TableCell>
                      <TableCell>Senior Developer</TableCell>
                      <TableCell>Active</TableCell>
                    </TableRow>
                    <TableRow key="4">
                      <TableCell>William Howard</TableCell>
                      <TableCell>Community Manager</TableCell>
                      <TableCell>Vacation</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
    
  

 
};
export default LeaderBoardModal
