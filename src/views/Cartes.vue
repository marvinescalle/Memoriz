<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

import Categorie from "@/models/categorie";
import { useCategorieStore } from "@/store/categorie";
import Theme from "@/models/theme";
import { useThemeStore } from "@/store/theme";
import Carte from "@/models/carte";
import { useCarteStore } from "@/store/cartes";


const categorie = useCategorieStore();

const handleMenuCategorie = (value: string, c: Categorie) => {
  if (value === "delete") categorie.openDelete(c);
  else if (value === "edit") categorie.openEdit(c);
};

const theme = useThemeStore();

const handleMenuTheme = (value: string, c: Theme) => {
  if (value === "delete") theme.openDelete(c);
  else if (value === "edit") theme.openEdit(c, true);
};

const carte = useCarteStore();

const handleOpenMedia = (carte: Carte, type: "recto" | "verso") => {
  const data = (type === "recto" ? carte.rectoMedia : carte.versoMedia)!;
  const mediaType = (
    type === "recto" ? carte.rectoMediaType : carte.versoMediaType
  )!;
  const url = URL.createObjectURL(new Blob([data.buffer], { type: mediaType }));
  window.open(url, "_blank");
};
const handleMenuCarte = (value: string, c: Carte) => {
  if (value === "delete") carte.openDelete(c);
  else if (value === "edit") carte.openEdit(c, true);
};

const rectoMediaSrc = (c: Carte) => {
  if (c.rectoMediaType?.startsWith("image/") && c.rectoMedia) {
    const url = URL.createObjectURL(new Blob([c.rectoMedia.buffer], { type: c.rectoMediaType }));
    return url;
  }
  return "";
};

const versoMediaSrc = (c: Carte) => {
  if (c.versoMediaType?.startsWith("image/") && c.versoMedia) {
    const url = URL.createObjectURL(new Blob([c.versoMedia.buffer], { type: c.versoMediaType }));
    return url;
  }
  return "";
};




</script>

<template>
          
  <div class="categorie-container mt-2 mt-md-6 mt-lg-8 mt-xl-10">
<v-btn to="/" class="text-subtitle-1" :active="false">Menu</v-btn>  
    <div class="categorie-title mt-1 mt-md-2 mt-lg-4 mt-xl-6">
      <h3 class="text-h4 font-weight-bold">Catégories</h3>
      <v-btn variant="outlined" @click="categorie.openNew">+</v-btn>
    </div>
    <v-container fluid class="mt-4 mt-md-6 mt-lg-8">
      <template v-if="categorie.loading">
        <div class="d-flex justify-center">
          <v-progress-circular
            indeterminate
            color="deep-purple-accent-2"
          ></v-progress-circular>
        </div>
      </template>
      <template v-else-if="categorie.list.length === 0">
        <div class="d-flex justify-center">
          <h5 class="text-body-1 font-weight-medium font-italic">
            Pas de catégorie
          </h5>
        </div>
      </template>
      <template v-else>
        <v-row>
          <v-col v-for="c in categorie.list" :key="c.id" cols="12" sm="6" md="4">
            <v-card elevation="4">
              <div class="carte-title-container">
                <h6 class="text-h6" :title="c.title">{{ c.title }}</h6>
                <v-btn size="small" variant="tonal" @click.stop.prevent>
                  <p>modifier</p>
                  <v-menu activator="parent">
                    <v-list
                      @click:select="($event) => handleMenuCategorie($event.id as string, c)"
                    >
                      <v-list-item value="edit">Éditer</v-list-item>
                      <v-list-item value="delete">Supprimer</v-list-item>
                    </v-list>
                  </v-menu>
                </v-btn>
              </div>
              <div class="carte-description-container">
                {{ c.description ?? "Pas de description" }}
              </div>
            </v-card>
          </v-col>
        </v-row></template
      >
    </v-container>
  </div>

  <!-- 
  Theme
 -->

  <div class="theme-container mt-4 mt-md-8 mt-lg-12 mt-xl-16">
    <div class="theme-title">
      <h3 class="text-h4 font-weight-bold">Thèmes</h3>
      <v-btn variant="outlined" @click="() => theme.openNew()">+</v-btn>
    </div>
    <v-container fluid class="mt-4 mt-md-6 mt-lg-8">
      <template v-if="theme.loading">
        <div class="d-flex justify-center">
          <v-progress-circular
            indeterminate
            color="deep-purple-accent-2"
          ></v-progress-circular>
        </div>
      </template>
      <template v-else-if="theme.list.length === 0">
        <div class="d-flex justify-center">
          <h5 class="text-body-1 font-weight-medium font-italic">
            Pas de catégorie
          </h5>
        </div>
      </template>
      <template v-else>
        <v-row>
          <v-col v-for="t in theme.list" :key="t.id" cols="12" sm="6" md="4">
            <v-card elevation="4">
              <div class="carte-title-container">
                <h6 class="text-h6" :title="t.title">{{ t.title }}</h6>
                <v-btn size="small" variant="tonal" @click.stop.prevent>
                  <p>modifier</p>
                  <v-menu activator="parent">
                    <v-list
                      @click:select="($event) => handleMenuTheme($event.id as string, t)"
                    >
                      <v-list-item value="edit">Éditer</v-list-item>
                      <v-list-item value="delete">Supprimer</v-list-item>
                    </v-list>
                  </v-menu>
                </v-btn>
              </div>
              <div class="carte-description-container">
                {{ t.description ?? "Pas de déscription" }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>

  <!-- 
    Carte
   -->

  <div class="carte-container mt-4 mt-md-8 mt-lg-12 mt-xl-16">
    <div class="carte-title">
      <h3 class="text-h4 font-weight-bold">Cartes</h3>
      <v-btn variant="outlined" @click="() => carte.openNew()">+</v-btn>
    </div>
    <v-container fluid class="mt-4 mt-md-6 mt-lg-8">
      <template v-if="carte.loading">
        <div class="d-flex justify-center">
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
      </template>
      <template v-else-if="carte.list.length === 0">
        <div class="d-flex justify-center">
          <h5 class="text-body-1 font-weight-medium font-italic">
            Pas de carte
          </h5>
        </div>
      </template>
      <template v-else>
        <v-row>
          <v-col
            v-for="c in carte.list"
            :key="c.id"
            cols="12"
            sm="6"
            md="4"
            lg=""
          >
            <v-card elevation="4">
              <div class="carte-title-container">
                <span class="text-body-1 font-weight-bold" :title="c.title">
                  {{ c.title }}
                </span>
                <v-btn size="small" variant="tonal" @click.stop.prevent>
                  <p>modifier</p>
                  <v-menu activator="parent">
                    <v-list
                      @click:select="($event) => handleMenuCarte($event.id as string, c)"
                    >
                      <v-list-item value="edit">Éditer</v-list-item>
                      <v-list-item value="delete">Supprimer</v-list-item>
                    </v-list>
                  </v-menu>
                </v-btn>
              </div>
              <div class="carte-info">
                <div>
                  <span class="text-body-2 font-weight-medium">Question</span>
                  <div v-if="c.rectoType === 'text'">
                    {{ c.rectoText }}
                  </div>
                  <div
                    class="carte-media"
                    v-else
                    @click="() => handleOpenMedia(c, 'recto')"
                  >
                    <img v-if="c.rectoType === 'media' && c.rectoMediaType?.startsWith('image/')" :src="rectoMediaSrc(c)" />
                    <!-- Autres types de contenu peuvent être ajoutés ici -->
                  </div>
                </div>
                <div>
                  <span class="text-body-2 font-weight-medium">Réponse</span>
                  <div v-if="c.versoType === 'text'">
                    {{ c.versoText }}
                  </div>
                  <div
                    class="carte-media"
                    v-else
                    @click="() => handleOpenMedia(c, 'verso')"
                  >
                    <img v-if="c.versoType === 'media' && c.versoMediaType?.startsWith('image/')" :src="versoMediaSrc(c)" />

                    <!-- Autres types de contenu peuvent être ajoutés ici -->
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<style lang="scss" scoped>
.categorie-container {
  margin: 0 auto;
  max-width: 1000px;
  width: 80%;
}
.categorie-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.theme-container {
  margin: 0 auto;
  max-width: 1000px;
  width: 80%;
}
.theme-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.carte-container {
  margin: 0 auto;
  max-width: 1000px;
  width: 80%;
}
.carte-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.carte-info {
  display: flex;
  padding: 8px 16px;
  & > div {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .carte-media {
      cursor: pointer;
    }
  }
}
</style>
