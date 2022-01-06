import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SceneState } from '../interfaces/scene-state';
import { Response } from '../interfaces/response';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class WebapiService {

  constructor(
    private http: HttpClient,
    private storage: StorageService,
  ) { }

  writeSceneState(data: SceneState): void {
    const url = `http://localhost:3000/writeState`;
    this.http.post<Response>(url, JSON.stringify(data)).subscribe((response: Response) => {
      this.storage.updateCookie('ThreeJSScene', response.message);
    }); 
  }

  readSceneState(): Observable<Response> {
    const stateID: string = this.storage.getCookie('ThreeJSScene');
    const url = `http://localhost:3000/readState/${stateID}`;
    return this.http.get<Response>(url);
  }
}
