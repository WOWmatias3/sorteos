import { Component, Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { trigger, transition, style, animate, state } from '@angular/animations';

export interface Player {
  id: number;
  name: string;
  sorteado: boolean;
  grupo: number | null;
}

export interface Group 
  { numero: number; 
    jugador1: Player | null; 
    jugador2: Player | null;
  }
  @Directive({
    selector: '[ifChanges]'
  })
  export class IfChangesDirective {
    private currentValue: any;
    private hasView = false;
  
    constructor(
      private viewContainer: ViewContainerRef,
      private templateRef: TemplateRef<any>
    ) { }
  
    @Input() set ifChanges(val: any) {
      if (!this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (val !== this.currentValue) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.currentValue = val;
      }
    }
  }

@Component({
  selector: 'app-player-management',
  templateUrl: './player-management.component.html',
  styleUrls: ['./player-management.component.scss'],
  animations: [
    trigger('myTrigger', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', [animate('0.2s 0.2s ease-in')]),
      transition('* => void', [animate('0.2s ease-in')])
    ])
  ],
})
export class PlayerManagementComponent implements OnInit {
  newPlayerName: string = '';
  players: Player[] = [];
  groups: Group[] = [];
  jugadorSorteado: string = '';
  showFinalPlayer: boolean = false;
  showingNames: boolean = false;
  selectedPlayer: Player | null = null;

  groupsToShow = 10;


  animatedGroupNames: string[] = [];
  selectedGroup: string = '';
  showFinalGroup: boolean = false;
  errorSelect: any = null
  sorteando = false;

  ngOnInit(): void {
    while (this.players.length < 16) {
      this.players.push({ id: this.players.length + 1, name: `Jugador ${this.players.length + 1}`, sorteado: false, grupo: null });
    }
    while (this.groups?.length < 8) {
      this.groups.push(
        {
          numero: this.groups.length + 1,
          jugador1: null,
          jugador2: null
        }
      )
    }
  }
  get allowedPlayers() {
    return this.players.filter((player) => player.sorteado !== true)
  }

  get sortedPlayers() {
    return this.players
      .sort((a, b) => {
        if (a.grupo === null && b.grupo === null) {
          return 0;
        } else if (a.grupo === null) {
          return 1;
        } else if (b.grupo === null) {
          return -1;
        } else {
          return a.grupo - b.grupo;
        }
      });
  }

  addPlayer() {
    if (this.players.length < 16) {
      this.players.push({ id: this.players.length + 1, name: this.newPlayerName, sorteado: false, grupo: null });
      this.newPlayerName = '';
    } else {
      alert('Ya has agregado el máximo de 16 jugadores.');
    }
  }

  drawGroups() {
    if (this.players.length < 16) {
      alert('Necesitas 16 jugadores para sortear.');
      return;
    }

    const playersToDraw = this.players.filter(player => !player.sorteado);

    if (playersToDraw.length === 0) {
      alert('Todos los jugadores ya han sido sorteados.');
      return;
    }
    this.sorteando = true;

    this.showingNames = true;
    const grupos = this.getAvailableGroups();
    if (grupos.length === 0 ){
      return;
    }
    const selectedGroup = grupos[Math.floor(Math.random() * grupos.length)];
    this.animateGroupNames(grupos.map(group => group.numero), selectedGroup.numero);
  }

  getAvailableGroups(): Group[] {
  const grupos = this.groups.filter((group) => {
    return !group.jugador1 || !group.jugador2;
  });
    return grupos;
  }

  private assignPlayerToGroup(player: Player, groupNumber: number): void {
    const groupToAssing: Group = this.groups.find((group) => group.numero === groupNumber) as Group;
    if (!groupToAssing?.jugador1) {
      groupToAssing.jugador1 = player;
      player.sorteado = true;
      player.grupo = groupNumber;
      this.selectedPlayer = null;
      this.sorteando = false;
      return;
    } else if (!groupToAssing?.jugador2) {
      groupToAssing.jugador2 = player;
      player.sorteado = true;
      player.grupo = groupNumber;
      this.selectedPlayer = null;
      this.sorteando = false;
      return;
    } else {
        alert('El grupo no tiene asignacion');
        this.sorteando = false;
    }
  }


  animateGroupNames(names: number[], finalGroupNumber: number) {
  if (this.selectedPlayer === null){
    this.errorSelect = 'Selecciona un jugador';
  }
    let index = 0;
    const intervalId = setInterval(() => {

      let newGroup =`${names[Math.floor(Math.random() * names.length)]}`;
      let j = 0
      while (newGroup == this.selectedGroup && j !== 3) {
        newGroup =`${names[Math.floor(Math.random() * names.length)]}`;
        j++
      }
      this.selectedGroup = newGroup;

      index ++;

      if (index === 3) {
        clearInterval(intervalId);
        this.showFinalGroup = true;
        this.selectedGroup = `Grupo ${finalGroupNumber}`;
        this.assignPlayerToGroup(this.selectedPlayer as Player, finalGroupNumber);
      }
    }, 400);
  }

  borrarJugador(playerId: number) {
    const playerIndex =this.players.findIndex(player => player.id === playerId);
    this.players.splice(playerIndex,1);
    this.groups = this.groups.map((group) => {
      if (group.jugador1?.id === playerId) {
        group.jugador1 = null;
      } else if (group.jugador2?.id === playerId) {
        group.jugador2 = null;
      }
      return group;
    });
  }

}
