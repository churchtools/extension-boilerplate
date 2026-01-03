import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { GroupMember } from '../utils/ct-types';
import { churchtoolsClient } from '@churchtools/churchtools-client';
import { ChurchtoolsService } from './churchtools.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('sola-hannover');
  private readonly churchToolsService = inject(ChurchtoolsService);
  groups$ = this.churchToolsService.getChildrenGroups(73);
  groupMembers$ = this.churchToolsService.getUsersFromGroup(32);

  ngOnInit(): void {

  }
  
    getAge(birthday: string | unknown): number | string {
      if (typeof birthday !== 'string') return '';
  
      const birthDate = new Date(birthday);
      const today = new Date();
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
  
      // Adjust if the birthday hasn't happened yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
  
      return age;
    }
  // Inside your App component class
  getExtraField(member: any, fieldName: string): string {
    if (!member.fields) return '';
    const field = member.fields.find((f: any) => f.name === fieldName);
    return field ? field.value : '';
  }
  getPersonField(member: any, key: string): any {
    return member.personFields ? (member.personFields as any)[key] : null;
  }
}
