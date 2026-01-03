import { Injectable, Signal } from '@angular/core';
import { environment } from '../environments/environment.development';
import { churchtoolsClient } from '@churchtools/churchtools-client';
import { DomainObjectGroup, Group, GroupMember, DomainObjectPerson } from '../utils/ct-types';
import { BehaviorSubject, filter, from, Observable, switchMap } from 'rxjs';
import { GroupMemberExtended } from '../utils/app-types';

@Injectable({
  providedIn: 'root',
})
export class ChurchtoolsService {
  loggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    const baseUrl = environment.ctBaseUrl;
    churchtoolsClient.setBaseUrl(baseUrl);

    const username = environment.ctUsername;
    const password = environment.ctPassword;

    churchtoolsClient.post('/login', { username, password }).then((login) => {
      this.loggedIn$.next(true);
    });
  }

  getChildrenGroups(group: number): Observable<DomainObjectGroup[]> {
    return this.loggedIn$.pipe(
      filter(
        (loggedIn) => loggedIn === true),
      switchMap(
        (file) => from(
          churchtoolsClient.get<DomainObjectGroup[]>(`/groups/${group}/children?limit=100`)
        )
      )
    );
  }

  getUsersFromGroup(group: number): Observable<GroupMember[]> {
    return this.loggedIn$.pipe(
      filter(
        (loggedIn) => loggedIn === true),
      switchMap(
        (file) => from(
          churchtoolsClient.get<GroupMember[]>(`/groups/${group}/members?limit=200&personFields[]=birthday&personFields[]=sexID`)
        )
      )
    );
  }
}
