import {BrowserModule} from "@angular/platform-browser";
import {APP_INITIALIZER, NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {RouterModule, Routes} from "@angular/router";

import {AppComponent} from "./app.component";
import {MapComponent} from "./ui/map-cmp/map.component";
import {MapsService} from "./services/maps/maps.service";
import {TilesLoaderService} from "./services/tiles/tiles.service";
import {ScenegraphService} from "./services/scene-graph/scenegraph.service";
import {EntityFactoryService} from "./services/entityFactory/entityFactory.service";
import {HotkeyModule} from "angular2-hotkeys";
import {InformationsComponent} from "./ui/description/informations.component";
import {EntitiesService} from "./services/entities/entities.service";
import {RenderableSystem} from "./systems/renderable.system";
import {MovementSystem} from "./systems/movement.system";
import {MainscreenComponent} from "./screens/mainscreen/mainscreen.component";
import {StartscreenComponent} from "./screens/startscreen/startscreen.component";
import {SavestateSystem} from "./systems/savestate.system";
import {DescriptionsService} from "./services/informations/descriptions.service";
import {KeyboardinputSystem} from "./systems/keyboardinput.system";
import {PartyService} from "./services/party/party.service";
import {PartyComponent} from "./ui/party/party.component";
import {SubpartyComponent} from "./ui/subparty/subparty.component";
import {ConfigService} from "./services/config/config.service";

const appRoutes: Routes = [
    {path: "main", component: StartscreenComponent},
    {path: "", component: MainscreenComponent}
];

export function useFactory(service: ConfigService) {
    return () => service.loadConfig();
}

@NgModule({
              declarations: [
                  AppComponent,
                  MapComponent,
                  InformationsComponent,
                  MainscreenComponent,
                  StartscreenComponent,
                  PartyComponent,
                  SubpartyComponent
              ],
              imports: [
                  BrowserModule,
                  FormsModule,
                  HttpModule,
                  HotkeyModule.forRoot(),
                  RouterModule.forRoot(appRoutes)
              ],
              providers: [
                  {
                      provide: APP_INITIALIZER,
                      useFactory: useFactory,
                      deps: [ConfigService],
                      multi: true
                  },
                  ConfigService,
                  MapsService,
                  EntitiesService,
                  RenderableSystem,
                  TilesLoaderService,
                  ScenegraphService,
                  EntityFactoryService,
                  KeyboardinputSystem,
                  MovementSystem,
                  SavestateSystem,
                  DescriptionsService,
                  PartyService
              ],
              bootstrap: [AppComponent]
          })
export class AppModule {
}
